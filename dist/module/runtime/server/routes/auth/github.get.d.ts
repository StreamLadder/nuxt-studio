export interface OAuthGitHubConfig {
    /**
     * GitHub OAuth Client ID
     * @default process.env.STUDIO_GITHUB_CLIENT_ID
     */
    clientId?: string;
    /**
     * GitHub OAuth Client Secret
     * @default process.env.STUDIO_GITHUB_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * GitHub OAuth Scope
     * @default []
     * @see https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps
     * @example ['user:email']
     */
    scope?: string[];
    /**
     * Require email from user, adds the ['user:email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * GitHub OAuth Authorization URL
     * @default 'https://github.com/login/oauth/authorize'
     */
    authorizationURL?: string;
    /**
     * GitHub OAuth Token URL
     * @default 'https://github.com/login/oauth/access_token'
     */
    tokenURL?: string;
    /**
     * GitHub API URL
     * @default 'https://api.github.com'
     */
    apiURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#1-request-a-users-github-identity
     * @example { allow_signup: 'true' }
     */
    authorizationParams?: Record<string, string>;
    /**
     * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
     * Use `process.env.STUDIO_GITHUB_REDIRECT_URL` to overwrite the default redirect URL.
     * @default is ${hostname}/__nuxt_studio/auth/github
     */
    redirectURL?: string;
}
declare const _default: import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<void>>;
export default _default;
