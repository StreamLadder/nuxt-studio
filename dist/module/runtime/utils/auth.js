import { getRandomValues } from "uncrypto";
import { getCookie, deleteCookie, setCookie, getRequestProtocol, createError } from "h3";
import { FetchError } from "ofetch";
export async function requestAccessToken(url, options) {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    ...options.headers
  };
  const body = headers["Content-Type"] === "application/x-www-form-urlencoded" ? new URLSearchParams(
    options.body || options.params || {}
  ).toString() : options.body;
  return $fetch(url, {
    method: "POST",
    headers,
    body
  }).catch((error) => {
    if (error instanceof FetchError && error.status === 401) {
      return error.data;
    }
    throw error;
  });
}
export async function generateOAuthState(event) {
  const newState = getRandomBytes(32);
  setCookie(event, "studio-oauth-state", newState, {
    path: "/",
    httpOnly: true,
    // Use secure cookies over HTTPS, required for locally testing purposes
    secure: getRequestProtocol(event) === "https",
    sameSite: "lax",
    maxAge: 60 * 15
    // 15 minutes
  });
  return newState;
}
export function validateOAuthState(event, receivedState) {
  const storedState = getCookie(event, "studio-oauth-state");
  if (!storedState) {
    throw createError({
      statusCode: 400,
      message: "OAuth state cookie not found. Please try logging in again.",
      data: {
        hint: "State cookie may have expired or been cleared"
      }
    });
  }
  if (receivedState !== storedState) {
    throw createError({
      statusCode: 400,
      message: "Invalid state - OAuth state mismatch",
      data: {
        hint: "This may be caused by browser refresh, navigation, or expired session"
      }
    });
  }
  deleteCookie(event, "studio-oauth-state");
}
function getRandomBytes(size = 32) {
  return encodeBase64Url(getRandomValues(new Uint8Array(size)));
}
function encodeBase64Url(input) {
  return btoa(String.fromCharCode.apply(null, Array.from(input))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
