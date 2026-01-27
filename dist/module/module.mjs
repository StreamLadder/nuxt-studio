import { addServerHandler, addVitePlugin, useLogger, defineNuxtModule, createResolver, addServerImports, extendViteConfig, addPlugin, addTemplate } from '@nuxt/kit';
import { createHash } from 'node:crypto';
import { defu } from 'defu';
import { resolve } from 'node:path';
import fsDriver from 'unstorage/drivers/fs';
import { createStorage } from 'unstorage';
import { withLeadingSlash } from 'ufo';

async function getAssetsStorageDevTemplate(_assetsStorage, _nuxt) {
  return [
    "import { createStorage } from 'unstorage'",
    "import httpDriver from 'unstorage/drivers/http'",
    "",
    `const storage = createStorage({ driver: httpDriver({ base: '/__nuxt_studio/dev/public' }) })`,
    "export const publicAssetsStorage = storage"
  ].join("\n");
}
async function getAssetsStorageTemplate(assetsStorage, _nuxt) {
  const keys = await assetsStorage.getKeys();
  return [
    "import { createStorage } from 'unstorage'",
    "const storage = createStorage({})",
    "",
    ...keys.map((key) => {
      const path = withLeadingSlash(key.replace(/:/g, "/"));
      const value = {
        id: `public-assets/${key.replace(/:/g, "/")}`,
        extension: key.split(".").pop(),
        stem: key.split(".").join("."),
        path,
        fsPath: path
      };
      return `storage.setItem('${value.id}', ${JSON.stringify(value)})`;
    }),
    "",
    "export const publicAssetsStorage = storage"
  ].join("\n");
}

const version = "1.2.0";

function setupDevMode(nuxt, runtime, assetsStorage) {
  nuxt.options.nitro.storage = {
    ...nuxt.options.nitro.storage,
    nuxt_studio_content: {
      driver: "fs",
      base: resolve(nuxt.options.rootDir, "content")
    },
    nuxt_studio_public_assets: {
      driver: "fs",
      base: resolve(nuxt.options.rootDir, "public")
    }
  };
  addServerHandler({
    route: "/__nuxt_studio/dev/content/**",
    handler: runtime("./server/routes/dev/content/[...path]")
  });
  addServerHandler({
    route: "/__nuxt_studio/dev/public/**",
    handler: runtime("./server/routes/dev/public/[...path]")
  });
  addVitePlugin({
    name: "nuxt-studio",
    configureServer: (server) => {
      assetsStorage.watch((type, file) => {
        server.ws.send({
          type: "custom",
          event: "nuxt-studio:media:update",
          data: { type, id: `public-assets/${file}` }
        });
      });
    },
    closeWatcher: () => {
      assetsStorage.unwatch();
    }
  });
}

const logger = useLogger("nuxt-studio");
function validateAuthConfig(options) {
  const provider = options.repository?.provider || "github";
  const providerUpperCase = provider.toUpperCase();
  const hasGitToken = process.env.STUDIO_GITHUB_TOKEN || process.env.STUDIO_GITLAB_TOKEN;
  if (hasGitToken) {
    return;
  }
  const hasGitHubAuth = options.auth?.github?.clientId && options.auth?.github?.clientSecret;
  const hasGitLabAuth = options.auth?.gitlab?.applicationId && options.auth?.gitlab?.applicationSecret;
  const hasGoogleAuth = options.auth?.google?.clientId && options.auth?.google?.clientSecret;
  const hasGoogleModerators = (process.env.STUDIO_GOOGLE_MODERATORS?.split(",") || []).length > 0;
  if (hasGoogleAuth) {
    if (!hasGoogleModerators) {
      logger.error([
        "The `STUDIO_GOOGLE_MODERATORS` environment variable is required when using Google OAuth.",
        "Please set the `STUDIO_GOOGLE_MODERATORS` environment variable to a comma-separated list of email of the allowed users.",
        "Only users with these email addresses will be able to access studio with Google OAuth."
      ].join(" "));
    }
    if (!hasGitToken) {
      logger.warn([
        `The \`STUDIO_${providerUpperCase}_TOKEN\` environment variable is required when using Google OAuth with ${providerUpperCase} provider.`,
        `This token is used to push changes to the repository when using Google OAuth.`
      ].join(" "));
    }
  } else {
    const missingProviderEnv = provider === "github" ? !hasGitHubAuth : !hasGitLabAuth;
    if (missingProviderEnv) {
      logger.error([
        `In order to authenticate users, you need to set up a ${providerUpperCase} OAuth application.`,
        `Please set the \`STUDIO_${providerUpperCase}_CLIENT_ID\` and \`STUDIO_${providerUpperCase}_CLIENT_SECRET\` environment variables,`,
        `Alternatively, you can set up a Google OAuth application and set the \`STUDIO_GOOGLE_CLIENT_ID\` and \`STUDIO_GOOGLE_CLIENT_SECRET\` environment variables alongside with \`STUDIO_${providerUpperCase}_TOKEN\` to push changes to the repository.`
      ].join(" "));
    }
  }
}

const module$1 = defineNuxtModule({
  meta: {
    name: "nuxt-studio",
    configKey: "studio",
    version,
    docs: "https://content.nuxt.com/studio"
  },
  defaults: {
    dev: true,
    route: "/_studio",
    repository: {
      provider: "github",
      owner: "",
      repo: "",
      branch: "main",
      rootDir: "",
      private: true
    },
    auth: {
      github: {
        clientId: process.env.STUDIO_GITHUB_CLIENT_ID,
        clientSecret: process.env.STUDIO_GITHUB_CLIENT_SECRET
      },
      gitlab: {
        applicationId: process.env.STUDIO_GITLAB_APPLICATION_ID,
        applicationSecret: process.env.STUDIO_GITLAB_APPLICATION_SECRET,
        instanceUrl: process.env.STUDIO_GITLAB_INSTANCE_URL || process.env.CI_SERVER_URL || "https://gitlab.com"
      },
      google: {
        clientId: process.env.STUDIO_GOOGLE_CLIENT_ID,
        clientSecret: process.env.STUDIO_GOOGLE_CLIENT_SECRET
      }
    },
    i18n: {
      defaultLocale: "en"
    },
    meta: {
      components: {
        include: [],
        exclude: []
      }
    }
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    const runtime = (...args) => resolver.resolve("./runtime", ...args);
    addServerImports([
      {
        name: "setStudioUserSession",
        from: runtime("./server/utils/session")
      },
      {
        name: "clearStudioUserSession",
        from: runtime("./server/utils/session")
      }
    ]);
    if (nuxt.options.dev === false || options.development?.sync === false) {
      options.dev = false;
    }
    if (!nuxt.options.dev && !nuxt.options._prepare) {
      validateAuthConfig(options);
    }
    nuxt.options.experimental = nuxt.options.experimental || {};
    nuxt.options.experimental.checkOutdatedBuildInterval = 1e3 * 30;
    nuxt.options.runtimeConfig.public.studio = {
      route: options.route,
      dev: Boolean(options.dev),
      development: {
        server: process.env.STUDIO_DEV_SERVER
      },
      // @ts-expect-error Autogenerated type does not match with options
      repository: options.repository,
      // @ts-expect-error Autogenerated type does not match with options
      i18n: options.i18n
    };
    nuxt.options.runtimeConfig.studio = {
      auth: {
        sessionSecret: createHash("md5").update([
          options.auth?.github?.clientId,
          options.auth?.github?.clientSecret,
          options.auth?.gitlab?.applicationId,
          options.auth?.gitlab?.applicationSecret,
          options.auth?.google?.clientId,
          options.auth?.google?.clientSecret,
          process.env.STUDIO_GITHUB_TOKEN,
          process.env.STUDIO_GITLAB_TOKEN
        ].join("")).digest("hex"),
        // @ts-expect-error autogenerated type doesn't match with project options
        github: options.auth?.github,
        // @ts-expect-error autogenerated type doesn't match with project options
        gitlab: options.auth?.gitlab,
        // @ts-expect-error autogenerated type doesn't match with project options
        google: options.auth?.google
      },
      // @ts-expect-error Autogenerated type does not match with options
      repository: options.repository,
      // @ts-expect-error Autogenerated type does not match with options
      meta: options.meta,
      // @ts-expect-error Autogenerated type does not match with options
      markdown: nuxt.options.content?.build?.markdown || {}
    };
    nuxt.options.vite = defu(nuxt.options.vite, {
      vue: {
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === "nuxt-studio"
          }
        }
      }
    });
    extendViteConfig((config) => {
      config.define ||= {};
      config.define["import.meta.preview"] = true;
      config.optimizeDeps ||= {};
      config.optimizeDeps.include = [
        ...config.optimizeDeps.include || [],
        "nuxt-studio > debug",
        "nuxt-studio > extend"
      ];
    });
    addPlugin(process.env.STUDIO_DEV_SERVER ? runtime("./plugins/studio.client.dev") : runtime("./plugins/studio.client"));
    const assetsStorage = createStorage({
      driver: fsDriver({
        base: resolve(nuxt.options.rootDir, "public")
      })
    });
    addTemplate({
      filename: "studio-public-assets.mjs",
      getContents: () => options.dev ? getAssetsStorageDevTemplate() : getAssetsStorageTemplate(assetsStorage)
    });
    if (options.dev) {
      setupDevMode(nuxt, runtime, assetsStorage);
    }
    addServerHandler({
      route: "/__nuxt_studio/auth/github",
      handler: runtime("./server/routes/auth/github.get")
    });
    addServerHandler({
      route: "/__nuxt_studio/auth/google",
      handler: runtime("./server/routes/auth/google.get")
    });
    addServerHandler({
      route: "/__nuxt_studio/auth/gitlab",
      handler: runtime("./server/routes/auth/gitlab.get")
    });
    addServerHandler({
      route: "/__nuxt_studio/auth/session",
      handler: runtime("./server/routes/auth/session.get")
    });
    addServerHandler({
      method: "delete",
      route: "/__nuxt_studio/auth/session",
      handler: runtime("./server/routes/auth/session.delete")
    });
    addServerHandler({
      route: options.route,
      handler: runtime("./server/routes/admin")
    });
    addServerHandler({
      route: "/__nuxt_studio/meta",
      handler: runtime("./server/routes/meta")
    });
    addServerHandler({
      route: "/sw.js",
      handler: runtime("./server/routes/sw")
    });
  }
});

export { module$1 as default };
