import { FetchError } from "ofetch";
import { eventHandler, getQuery, sendRedirect, createError, getRequestURL, deleteCookie, getCookie } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { useRuntimeConfig } from "#imports";
import { generateOAuthState, validateOAuthState } from "../../../utils/auth.js";
import { setInternalStudioUserSession } from "../../utils/session.js";
export default eventHandler(async (event) => {
  const studioConfig = useRuntimeConfig(event).studio;
  const instanceUrl = studioConfig?.auth?.gitlab?.instanceUrl || "https://gitlab.com";
  const config = defu(studioConfig?.auth?.gitlab, {
    applicationId: process.env.STUDIO_GITLAB_APPLICATION_ID,
    applicationSecret: process.env.STUDIO_GITLAB_APPLICATION_SECRET,
    redirectURL: process.env.STUDIO_GITLAB_REDIRECT_URL,
    instanceUrl,
    authorizationURL: `${instanceUrl}/oauth/authorize`,
    tokenURL: `${instanceUrl}/oauth/token`,
    apiURL: `${instanceUrl}/api/v4`,
    authorizationParams: {},
    emailRequired: true
  });
  const query = getQuery(event);
  if (query.error) {
    throw createError({
      statusCode: 401,
      message: `GitLab login failed: ${query.error || "Unknown error"}`,
      data: query
    });
  }
  if (!config.applicationId || !config.applicationSecret) {
    throw createError({
      statusCode: 500,
      message: "Missing GitLab application ID or secret",
      data: config
    });
  }
  const requestURL = getRequestURL(event);
  config.redirectURL = config.redirectURL || `${requestURL.protocol}//${requestURL.host}${requestURL.pathname}`;
  if (!query.code) {
    const state = await generateOAuthState(event);
    config.scope = config.scope || [];
    if (!config.scope.includes("api")) {
      config.scope.push("api");
    }
    return sendRedirect(
      event,
      withQuery(config.authorizationURL, {
        client_id: config.applicationId,
        redirect_uri: config.redirectURL,
        response_type: "code",
        scope: config.scope.join(" "),
        state,
        ...config.authorizationParams
      })
    );
  }
  validateOAuthState(event, query.state);
  if (studioConfig.repository.provider !== "gitlab") {
    throw createError({
      statusCode: 500,
      message: "GitLab Oauth provider only supports GitLab repository provider"
    });
  }
  const token = await requestAccessToken(config.tokenURL, {
    body: {
      grant_type: "authorization_code",
      client_id: config.applicationId,
      client_secret: config.applicationSecret,
      redirect_uri: config.redirectURL,
      code: query.code
    }
  });
  if (token.error || !token.access_token) {
    throw createError({
      statusCode: 500,
      message: "Failed to get access token",
      data: token
    });
  }
  const accessToken = token.access_token;
  const user = await $fetch(`${config.apiURL}/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!user.email && config.emailRequired) {
    throw createError({
      statusCode: 500,
      message: "Could not get GitLab user email",
      data: token
    });
  }
  const moderators = process.env.STUDIO_GITLAB_MODERATORS?.split(",") || [];
  if (moderators.length > 0 && !moderators.includes(String(user.email))) {
    throw createError({
      statusCode: 403,
      message: "You are not authorized to access the studio"
    });
  }
  await setInternalStudioUserSession(event, {
    providerId: user.id.toString(),
    accessToken: token.access_token,
    name: user.name || user.username,
    avatar: user.avatar_url,
    email: user.email,
    provider: "gitlab"
  });
  const redirect = decodeURIComponent(getCookie(event, "studio-redirect") || "/");
  deleteCookie(event, "studio-redirect");
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return sendRedirect(event, redirect);
  }
  return sendRedirect(event, "/");
});
async function requestAccessToken(url, options) {
  try {
    return await $fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: options.body,
      params: options.params
    });
  } catch (error) {
    if (error instanceof FetchError) {
      return error.data || { error: error.message };
    }
    return { error: "Unknown error" };
  }
}
