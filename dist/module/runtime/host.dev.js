import { useStudioHost as useStudioHostBase } from "./host.js";
import { getCollectionByFilePath, generateIdFromFsPath, generateFsPathFromId, getCollectionById } from "./utils/collection.js";
import { applyCollectionSchema, sanitizeDocumentTree } from "./utils/document/index.js";
import { createStorage } from "unstorage";
import httpDriver from "unstorage/drivers/http";
import { useRuntimeConfig } from "#imports";
import { collections } from "#content/preview";
import { debounce } from "perfect-debounce";
import { getCollectionSourceById } from "./utils/source.js";
export function useStudioHost(user, repository) {
  const host = useStudioHostBase(user, repository);
  if (!useRuntimeConfig().public.studio.dev) {
    return host;
  }
  host.meta.dev = true;
  const devStorage = createStorage({
    driver: httpDriver({ base: "/__nuxt_studio/dev/content" })
  });
  host.app.requestRerender = () => {
  };
  host.document.db.upsert = debounce(async (fsPath, upsertedDocument) => {
    const collectionInfo = getCollectionByFilePath(fsPath, collections);
    if (!collectionInfo) {
      throw new Error(`Collection not found for fsPath: ${fsPath}`);
    }
    const id = generateIdFromFsPath(fsPath, collectionInfo);
    const document = applyCollectionSchema(id, collectionInfo, upsertedDocument);
    const sanitizedDocument = sanitizeDocumentTree(document, collectionInfo);
    const content = await host.document.generate.contentFromDocument(sanitizedDocument);
    await $fetch("/__nuxt_studio/dev/content/" + fsPath, {
      method: "PUT",
      body: content,
      headers: { "content-type": "text/plain" },
      timeout: 100
    }).catch(() => {
    });
  }, 100);
  host.document.db.delete = async (fsPath) => {
    await devStorage.removeItem(fsPath);
  };
  host.on.documentUpdate = (fn) => {
    import.meta.hot.on("nuxt-content:update", (data) => {
      const collection = getCollectionById(data.key, collections);
      const source = getCollectionSourceById(data.key, collection.source);
      const fsPath = generateFsPathFromId(data.key, source);
      const isRemoved = data.queries.length === 0;
      fn(fsPath, isRemoved ? "remove" : "update");
    });
  };
  host.on.mediaUpdate = (fn) => {
    import.meta.hot.on("nuxt-studio:media:update", (data) => {
      fn(data.id, data.type);
    });
  };
  return host;
}
