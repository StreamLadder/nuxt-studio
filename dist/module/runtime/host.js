import { ref } from "vue";
import { ensure } from "./utils/ensure.js";
import { getCollectionByFilePath, generateIdFromFsPath, generateRecordDeletion, generateRecordInsert, generateFsPathFromId, getCollectionById } from "./utils/collection.js";
import { applyCollectionSchema, isDocumentMatchingContent, generateDocumentFromContent, generateContentFromDocument, areDocumentsEqual, pickReservedKeysFromDocument, removeReservedKeysFromDocument, sanitizeDocumentTree } from "./utils/document/index.js";
import { getHostStyles, getSidebarWidth, adjustFixedElements } from "./utils/sidebar.js";
import { clearError, getAppManifest, queryCollection, queryCollectionItemSurroundings, queryCollectionNavigation, queryCollectionSearchSections, useRuntimeConfig } from "#imports";
import { collections } from "#content/preview";
import { publicAssetsStorage } from "#build/studio-public-assets";
import { useHostMeta } from "./composables/useMeta.js";
import { generateIdFromFsPath as generateMediaIdFromFsPath } from "./utils/media.js";
import { getCollectionSourceById } from "./utils/source.js";
import { kebabCase } from "scule";
const serviceWorkerVersion = "v0.0.3";
function getLocalColorMode() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
function detectContentRoutingConfig() {
  const runtimeConfig = useRuntimeConfig();
  const studioRouting = runtimeConfig.public.studio.content?.routing;
  if (!studioRouting?.strategy) {
    return void 0;
  }
  return {
    strategy: studioRouting.strategy,
    defaultLocale: studioRouting.defaultLocale,
    locales: studioRouting.locales
  };
}
export function useStudioHost(user, repository) {
  let localDatabaseAdapter = null;
  let colorMode = getLocalColorMode();
  const isMounted = ref(false);
  const meta = useHostMeta();
  function useNuxtApp() {
    return window.useNuxtApp();
  }
  function useRouter() {
    return useNuxtApp().$router;
  }
  function useContent() {
    const $content = useNuxtApp().$content || {};
    return {
      ...$content,
      queryCollection,
      queryCollectionItemSurroundings,
      queryCollectionNavigation,
      queryCollectionSearchSections,
      collections
    };
  }
  function useContentDatabaseAdapter(collection) {
    return localDatabaseAdapter(collection);
  }
  function useContentCollections() {
    return Object.fromEntries(
      Object.entries(useContent().collections).filter(([, collection]) => {
        if (!collection.source.length || collection.source.some((source) => source.repository || source._custom)) {
          return false;
        }
        return true;
      })
    );
  }
  function useContentCollectionQuery(collection) {
    return useContent().queryCollection(collection);
  }
  const host = {
    meta: {
      dev: false,
      getComponents: () => meta.components.value,
      defaultLocale: useRuntimeConfig().public.studio.i18n?.defaultLocale || "en",
      getHighlightTheme: () => meta.highlightTheme.value,
      contentRouting: detectContentRoutingConfig()
    },
    on: {
      routeChange: (fn) => {
        const router = useRouter();
        router?.afterEach?.((to, from) => {
          fn(to, from);
        });
      },
      mounted: (fn) => ensure(() => isMounted.value, 400).then(fn),
      beforeUnload: (fn) => {
        host.ui.deactivateStudio();
        ensure(() => isMounted.value).then(() => {
          window.addEventListener("beforeunload", fn);
        });
      },
      colorModeChange: (fn) => {
        const localColorModeObserver = new MutationObserver(() => {
          colorMode = getLocalColorMode();
          fn(colorMode);
        });
        localColorModeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"]
        });
      },
      manifestUpdate: (fn) => {
        useNuxtApp().hooks.hookOnce("app:manifest:update", (meta2) => fn(meta2.id));
      },
      documentUpdate: (_fn) => {
      },
      mediaUpdate: (_fn) => {
      },
      requestDocumentEdit: (fn) => {
        useNuxtApp().hooks.hook("studio:document:edit", fn);
      }
    },
    ui: {
      colorMode,
      activateStudio: () => {
        document.body.setAttribute("data-studio-active", "true");
      },
      deactivateStudio: () => {
        document.body.removeAttribute("data-studio-active");
        host.ui.collapseSidebar();
        host.ui.updateStyles();
      },
      expandSidebar: () => {
        document.body.setAttribute("data-expand-sidebar", "true");
        host.ui.updateStyles();
      },
      collapseSidebar: () => {
        document.body.removeAttribute("data-expand-sidebar");
        host.ui.updateStyles();
      },
      updateStyles: () => {
        const hostStyles = getHostStyles();
        const styles = Object.keys(hostStyles).map((selector) => {
          const styleText = Object.entries(hostStyles[selector]).map(([key, value]) => `${kebabCase(key)}: ${value}`).join(";");
          return `${selector} { ${styleText} }`;
        }).join("");
        let styleElement = document.querySelector("[data-studio-style]");
        if (!styleElement) {
          styleElement = document.createElement("style");
          styleElement.setAttribute("data-studio-style", "");
          document.head.appendChild(styleElement);
        }
        styleElement.textContent = styles;
        const isSidebarExpanded = document.body.hasAttribute("data-expand-sidebar");
        adjustFixedElements(isSidebarExpanded ? getSidebarWidth() : 0);
      }
    },
    repository,
    user: {
      get: () => user
    },
    document: {
      db: {
        get: async (fsPath) => {
          const collectionInfo = getCollectionByFilePath(fsPath, useContentCollections());
          if (!collectionInfo) {
            throw new Error(`Collection not found for fsPath: ${fsPath}`);
          }
          const id = generateIdFromFsPath(fsPath, collectionInfo);
          const item = await useContentCollectionQuery(collectionInfo.name).where("id", "=", id).first();
          if (!item) {
            return void 0;
          }
          return sanitizeDocumentTree({ ...item, fsPath }, collectionInfo);
        },
        list: async () => {
          const collections2 = Object.values(useContentCollections()).filter((collection) => collection.name !== "info");
          const documentsByCollection = await Promise.all(collections2.map(async (collection) => {
            const documents = await useContentCollectionQuery(collection.name).all();
            return documents.map((document2) => {
              const source = getCollectionSourceById(document2.id, collection.source);
              const fsPath = generateFsPathFromId(document2.id, source);
              return sanitizeDocumentTree({ ...document2, fsPath }, collection);
            });
          }));
          return documentsByCollection.flat();
        },
        create: async (fsPath, content) => {
          const existingDocument = await host.document.db.get(fsPath);
          if (existingDocument) {
            throw new Error(`Cannot create document with fsPath "${fsPath}": document already exists.`);
          }
          const collectionInfo = getCollectionByFilePath(fsPath, useContentCollections());
          if (!collectionInfo) {
            throw new Error(`Collection not found for fsPath: ${fsPath}`);
          }
          const id = generateIdFromFsPath(fsPath, collectionInfo);
          const generateOptions = { collectionType: collectionInfo.type, compress: true };
          const document2 = await generateDocumentFromContent(id, content, generateOptions);
          const normalizedDocument = applyCollectionSchema(id, collectionInfo, document2);
          await host.document.db.upsert(fsPath, normalizedDocument);
          return sanitizeDocumentTree({ ...normalizedDocument, fsPath }, collectionInfo);
        },
        upsert: async (fsPath, document2) => {
          const collectionInfo = getCollectionByFilePath(fsPath, useContentCollections());
          if (!collectionInfo) {
            throw new Error(`Collection not found for fsPath: ${fsPath}`);
          }
          const id = generateIdFromFsPath(fsPath, collectionInfo);
          const normalizedDocument = applyCollectionSchema(id, collectionInfo, document2);
          await useContentDatabaseAdapter(collectionInfo.name).exec(generateRecordDeletion(collectionInfo, id));
          await useContentDatabaseAdapter(collectionInfo.name).exec(generateRecordInsert(collectionInfo, normalizedDocument));
        },
        delete: async (fsPath) => {
          const collection = getCollectionByFilePath(fsPath, useContentCollections());
          if (!collection) {
            throw new Error(`Collection not found for fsPath: ${fsPath}`);
          }
          const id = generateIdFromFsPath(fsPath, collection);
          await useContentDatabaseAdapter(collection.name).exec(generateRecordDeletion(collection, id));
        }
      },
      utils: {
        areEqual: (document1, document2) => areDocumentsEqual(document1, document2),
        isMatchingContent: async (content, document2) => isDocumentMatchingContent(content, document2),
        pickReservedKeys: (document2) => pickReservedKeysFromDocument(document2),
        removeReservedKeys: (document2) => removeReservedKeysFromDocument(document2),
        detectActives: () => {
          const wrappers = document.querySelectorAll("[data-content-id]");
          return Array.from(wrappers).map((wrapper) => {
            const id = wrapper.getAttribute("data-content-id");
            const title = id.split(/[/:]/).pop() || id;
            const collection = getCollectionById(id, useContentCollections());
            const source = getCollectionSourceById(id, collection.source);
            const fsPath = generateFsPathFromId(id, source);
            return {
              fsPath,
              title
            };
          });
        }
      },
      generate: {
        documentFromContent: async (id, content) => {
          const collection = getCollectionById(id, useContentCollections());
          const generateOptions = { collectionType: collection.type, compress: true };
          return await generateDocumentFromContent(id, content, generateOptions);
        },
        contentFromDocument: async (document2) => generateContentFromDocument(document2)
      }
    },
    media: {
      get: async (fsPath) => {
        return await publicAssetsStorage.getItem(generateMediaIdFromFsPath(fsPath));
      },
      list: async () => {
        return await Promise.all(await publicAssetsStorage.getKeys().then((keys) => keys.map((key) => publicAssetsStorage.getItem(key))));
      },
      upsert: async (fsPath, media) => {
        const id = generateMediaIdFromFsPath(fsPath);
        await publicAssetsStorage.setItem(generateMediaIdFromFsPath(fsPath), { ...media, id });
      },
      delete: async (fsPath) => {
        await publicAssetsStorage.removeItem(generateMediaIdFromFsPath(fsPath));
      }
    },
    app: {
      getManifestId: async () => {
        const manifest = await getAppManifest();
        return manifest.id;
      },
      requestRerender: async () => {
        if (useNuxtApp().payload.error) {
          await clearError({ redirect: `?t=${Date.now()}` });
        }
        useNuxtApp().hooks.callHookParallel("app:data:refresh");
      },
      navigateTo: (path) => {
        useRouter().push(path);
      },
      registerServiceWorker: () => {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.register(`/sw.js?${serviceWorkerVersion}`);
        }
      },
      unregisterServiceWorker: () => {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistrations().then((regs) => {
            regs.forEach((reg) => {
              const scriptURL = reg.active?.scriptURL || reg.waiting?.scriptURL || reg.installing?.scriptURL;
              if (scriptURL && scriptURL.endsWith(`/sw.js?${serviceWorkerVersion}`)) {
                reg.unregister();
              }
            });
          });
        }
      }
    },
    collection: {
      getByFsPath: (fsPath) => getCollectionByFilePath(fsPath, useContentCollections())
    }
  };
  (async () => {
    host.ui.activateStudio();
    ensure(() => useContent().queryCollection !== void 0, 500).then(() => ensure(() => useContent().loadLocalDatabase !== void 0)).then(() => useContent().loadLocalDatabase()).then((_localDatabaseAdapter) => {
      localDatabaseAdapter = _localDatabaseAdapter;
      isMounted.value = true;
    }).then(() => {
      return meta.fetch();
    });
    document.body.addEventListener("dblclick", (event) => {
      let element = event.target;
      while (element) {
        if (element.getAttribute("data-content-id")) {
          break;
        }
        element = element.parentElement;
      }
      if (element) {
        const id = element.getAttribute("data-content-id");
        const collection = getCollectionById(id, useContentCollections());
        const source = getCollectionSourceById(id, collection.source);
        const fsPath = generateFsPathFromId(id, source);
        useNuxtApp().hooks.callHook("studio:document:edit", fsPath);
      }
    });
    host.ui.updateStyles();
  })();
  return host;
}
