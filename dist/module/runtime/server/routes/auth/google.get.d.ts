export interface GoogleUser {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
}
export interface OAuthGoogleConfig {
    /**
     * Google OAuth Client ID
     * @default process.env.STUDIO_GOOGLE_CLIENT_ID
     */
    clientId?: string;
    /**
     * Google OAuth Client Secret
     * @default process.env.STUDIO_GOOGLE_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Google OAuth Scope
     * @default ['email', 'profile']
     * @see https://developers.google.com/identity/protocols/oauth2/scopes
     */
    scope?: string[];
    /**
     * Require email from user
     * @default false
     */
    emailRequired?: boolean;
    /**
     * Google OAuth Authorization URL
     * @default 'https://accounts.google.com/o/oauth2/v2/auth'
     */
    authorizationURL?: string;
    /**
     * Google OAuth Token URL
     * @default 'https://oauth2.googleapis.com/token'
     */
    tokenURL?: string;
    /**
     * Google User Info URL
     * @default 'https://www.googleapis.com/oauth2/v3/userinfo'
     */
    userURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://developers.google.com/identity/protocols/oauth2/web-server#creatingclient
     * @example { access_type: 'offline', prompt: 'consent' }
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * Use `process.env.STUDIO_GOOGLE_REDIRECT_URL` to overwrite the default redirect URL.
     * @default is ${hostname}/__nuxt_studio/auth/google
     */
    redirectURL?: string;
}
declare const _default: import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<void>>;
export default _default;
