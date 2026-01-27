import { eventHandler, createError, getQuery, sendRedirect, getRequestURL, getCookie, deleteCookie } from "h3";
import { withQuery } from "ufo";
import { defu } from "defu";
import { useRuntimeConfig } from "#imports";
import { generateOAuthState, requestAccessToken, validateOAuthState } from "../../../utils/auth.js";
import { setInternalStudioUserSession } from "../../utils/session.js";
export default eventHandler(async (event) => {
  const studioConfig = useRuntimeConfig(event).studio;
  const config = defu(studioConfig?.auth?.google, {
    clientId: process.env.STUDIO_GOOGLE_CLIENT_ID,
    clientSecret: process.env.STUDIO_GOOGLE_CLIENT_SECRET,
    redirectURL: process.env.STUDIO_GOOGLE_REDIRECT_URL,
    authorizationURL: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenURL: "https://oauth2.googleapis.com/token",
    userURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    authorizationParams: {},
    emailRequired: true
  });
  const query = getQuery(event);
  if (query.error) {
    throw createError({
      statusCode: 401,
      message: `Google login failed: ${query.error || "Unknown error"}`,
      data: query
    });
  }
  if (!config.clientId || !config.clientSecret) {
    throw createError({
      statusCode: 500,
      message: "Missing Google client ID or secret",
      data: config
    });
  }
  const requestURL = getRequestURL(event);
  config.redirectURL = config.redirectURL || `${requestURL.protocol}//${requestURL.host}${requestURL.pathname}`;
  if (!query.code) {
    const state = await generateOAuthState(event);
    config.scope = config.scope || ["email", "profile"];
    return sendRedirect(
      event,
      withQuery(config.authorizationURL, {
        response_type: "code",
        client_id: config.clientId,
        redirect_uri: config.redirectURL,
        scope: config.scope.join(" "),
        state,
        ...config.authorizationParams
      })
    );
  }
  validateOAuthState(event, query.state);
  const provider = studioConfig?.repository.provider;
  if (provider === "github" && !process.env.STUDIO_GITHUB_TOKEN) {
    throw createError({
      statusCode: 500,
      message: "`STUDIO_GITHUB_TOKEN` is not set. Google authenticated users cannot push changes to the repository without a valid GitHub token."
    });
  }
  if (provider === "gitlab" && !process.env.STUDIO_GITLAB_TOKEN) {
    throw createError({
      statusCode: 500,
      message: "`STUDIO_GITLAB_TOKEN` is not set. Google authenticated users cannot push changes to the repository without a valid GitLab token."
    });
  }
  const repositoryToken = provider === "github" ? process.env.STUDIO_GITHUB_TOKEN : process.env.STUDIO_GITLAB_TOKEN;
  const token = await requestAccessToken(config.tokenURL, {
    body: {
      grant_type: "authorization_code",
      code: query.code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectURL
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
  const user = await $fetch(
    config.userURL,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  if (!user.email && config.emailRequired) {
    throw createError({
      statusCode: 500,
      message: "Could not get Google user email",
      data: user
    });
  }
  const moderators = process.env.STUDIO_GOOGLE_MODERATORS?.split(",") || [];
  if (!moderators.includes(user.email)) {
    if (import.meta.dev && moderators.length === 0) {
      console.warn([
        "[Nuxt Studio] No moderators defined. Moderators are required for Google authentication.",
        "Please set the `STUDIO_GOOGLE_MODERATORS` environment variable to a comma-separated list of email addresses of the moderators."
      ].join("\n"));
    }
    throw createError({
      statusCode: 403,
      message: "You are not authorized to access the studio"
    });
  }
  await setInternalStudioUserSession(event, {
    providerId: String(user.sub).toString(),
    accessToken: repositoryToken,
    name: user.name || `${user.given_name || ""} ${user.family_name || ""}`.trim(),
    avatar: user.picture,
    email: user.email,
    provider: "google"
  });
  const redirect = decodeURIComponent(getCookie(event, "studio-redirect") || "");
  deleteCookie(event, "studio-redirect");
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return sendRedirect(event, redirect);
  }
  return sendRedirect(event, "/");
});
