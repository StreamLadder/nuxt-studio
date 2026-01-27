import * as _nuxt_schema from '@nuxt/schema';

interface MetaOptions {
    /**
     * Component filtering options.
     */
    components?: {
        /**
         * Patterns to include components.
         * If a pattern contains a /, it will be treated as a path filter.
         * Otherwise, it will be treated as a name filter.
         */
        include?: string[];
        /**
         * Patterns to exclude components.
         * If a pattern contains a /, it will be treated as a path filter.
         * Otherwise, it will be treated as a name filter.
         */
        exclude?: string[];
    };
}
interface RepositoryOptions {
    /**
     * The owner of the git repository.
     */
    owner: string;
    /**
     * The repository name.
     */
    repo: string;
    /**
     * The branch to use for the git repository.
     * @default 'main'
     */
    branch?: string;
    /**
     * The root directory to use for the git repository.
     * @default ''
     */
    rootDir?: string;
    /**
     * Whether the repository is private or public.
     * If set to false, the 'public_repo' scope will be used instead of the 'repo' scope.
     * @default true
     */
    private?: boolean;
}
interface GitHubRepositoryOptions extends RepositoryOptions {
    provider: 'github';
}
interface GitLabRepositoryOptions extends RepositoryOptions {
    provider: 'gitlab';
    instanceUrl?: string;
}
interface ModuleOptions {
    /**
     * The route to access the studio login page.
     * @default '/_studio'
     */
    route?: string;
    /**
     * The authentication settings for studio.
     */
    auth?: {
        /**
         * The GitHub OAuth credentials.
         */
        github?: {
            /**
             * The GitHub OAuth client ID.
             * @default process.env.STUDIO_GITHUB_CLIENT_ID
             */
            clientId?: string;
            /**
             * The GitHub OAuth client secret.
             * @default process.env.STUDIO_GITHUB_CLIENT_SECRET
             */
            clientSecret?: string;
        };
        /**
         * The GitLab OAuth credentials.
         */
        gitlab?: {
            /**
             * The GitLab OAuth application ID.
             * @default process.env.STUDIO_GITLAB_APPLICATION_ID
             */
            applicationId?: string;
            /**
             * The GitLab OAuth application secret.
             * @default process.env.STUDIO_GITLAB_APPLICATION_SECRET
             */
            applicationSecret?: string;
            /**
             * The GitLab instance URL (for self-hosted instances).
             * @default 'https://gitlab.com'
             */
            instanceUrl?: string;
        };
        /**
         * The Google OAuth credentials.
         * Note: When using Google OAuth, you must set STUDIO_GOOGLE_MODERATORS to a comma-separated
         * list of authorized email addresses, and either STUDIO_GITHUB_TOKEN or STUDIO_GITLAB_TOKEN
         * to push changes to your repository.
         */
        google?: {
            /**
             * The Google OAuth client ID.
             * @default process.env.STUDIO_GOOGLE_CLIENT_ID
             */
            clientId?: string;
            /**
             * The Google OAuth client secret.
             * @default process.env.STUDIO_GOOGLE_CLIENT_SECRET
             */
            clientSecret?: string;
        };
    };
    /**
     * The git repository information to connect to.
     */
    repository?: GitHubRepositoryOptions | GitLabRepositoryOptions;
    /**
     * Enable Nuxt Studio to edit content and media files on your filesystem.
     */
    dev: boolean;
    /**
     * Enable Nuxt Studio to edit content and media files on your filesystem.
     *
     * @deprecated Use the 'dev' option instead.
     */
    development?: {
        sync?: boolean;
    };
    /**
     * i18n settings for the Studio.
     */
    i18n?: {
        /**
         * The default locale to use.
         * @default 'en'
         */
        defaultLocale?: string;
    };
    /**
     * Meta options.
     */
    meta?: MetaOptions;
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

export { _default as default };
export type { ModuleOptions };
