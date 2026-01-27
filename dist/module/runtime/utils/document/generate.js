import { ContentFileExtension } from "../../types/content.js";
import { parseMarkdown } from "@nuxtjs/mdc/runtime/parser/index";
import { stringifyMarkdown } from "@nuxtjs/mdc/runtime";
import { visit } from "unist-util-visit";
import { compressTree, decompressTree } from "@nuxt/content/runtime";
import destr from "destr";
import { parseFrontMatter, stringifyFrontMatter } from "remark-mdc";
import { useHostMeta } from "../../composables/useMeta.js";
import { addPageTypeFields, generateStemFromId, getFileExtension } from "./utils.js";
import { removeReservedKeysFromDocument } from "./schema.js";
import { remarkEmojiPlugin } from "nuxt-studio/app/utils";
export async function generateDocumentFromContent(id, content, options = { compress: true }) {
  const [_id, _hash] = id.split("#");
  const extension = getFileExtension(id);
  if (extension === ContentFileExtension.Markdown) {
    return await generateDocumentFromMarkdownContent(id, content, options);
  }
  if (extension === ContentFileExtension.YAML || extension === ContentFileExtension.YML) {
    return await generateDocumentFromYAMLContent(id, content);
  }
  if (extension === ContentFileExtension.JSON) {
    return await generateDocumentFromJSONContent(id, content);
  }
  return null;
}
export async function generateDocumentFromYAMLContent(id, content) {
  const { data } = parseFrontMatter(`---
${content}
---`);
  let parsed = data;
  if (Array.isArray(data)) {
    console.warn(`YAML array is not supported in ${id}, moving the array into the \`body\` key`);
    parsed = { body: data };
  }
  const document = {
    id,
    extension: getFileExtension(id),
    stem: generateStemFromId(id),
    meta: {},
    ...parsed
  };
  if (parsed.body) {
    document.body = parsed.body;
  }
  return document;
}
export async function generateDocumentFromJSONContent(id, content) {
  let parsed = destr(content);
  if (Array.isArray(parsed)) {
    console.warn(`JSON array is not supported in ${id}, moving the array into the \`body\` key`);
    parsed = {
      body: parsed
    };
  }
  return {
    id,
    extension: ContentFileExtension.JSON,
    stem: generateStemFromId(id),
    meta: {},
    ...parsed,
    body: parsed.body || parsed
  };
}
export async function generateDocumentFromMarkdownContent(id, content, options = { compress: true }) {
  const markdownConfig = useHostMeta().markdownConfig.value;
  const document = await parseMarkdown(content, {
    contentHeading: markdownConfig?.contentHeading !== false ? options.collectionType === "page" : false,
    highlight: {
      theme: useHostMeta().highlightTheme.value
    },
    remark: {
      plugins: {
        "emoji": {
          instance: remarkEmojiPlugin
        },
        "remark-mdc": {
          options: {
            autoUnwrap: true
          }
        }
      }
    }
  });
  visit(document.body, (node) => node.type === "element" && node.tag === "a", (node) => {
    Reflect.deleteProperty(node.props, "rel");
  });
  let body = document.body;
  if (options.compress && document.body.type === "root") {
    body = compressTree(document.body);
  }
  const result = {
    id,
    meta: {},
    extension: "md",
    stem: id.split("/").slice(1).join("/").split(".").slice(0, -1).join("."),
    body: {
      ...body,
      toc: document.toc
    },
    ...document.data
  };
  if (options.collectionType === "page") {
    return addPageTypeFields(result);
  }
  return result;
}
export async function generateContentFromDocument(document) {
  const [id, _hash] = document.id.split("#");
  const extension = getFileExtension(id);
  if (extension === ContentFileExtension.Markdown) {
    return await generateContentFromMarkdownDocument(document);
  }
  if (extension === ContentFileExtension.YAML || extension === ContentFileExtension.YML) {
    return await generateContentFromYAMLDocument(document);
  }
  if (extension === ContentFileExtension.JSON) {
    return await generateContentFromJSONDocument(document);
  }
  return null;
}
export async function generateContentFromYAMLDocument(document) {
  return await stringifyFrontMatter(removeReservedKeysFromDocument(document), "", {
    prefix: "",
    suffix: "",
    lineWidth: 0
  });
}
export async function generateContentFromJSONDocument(document) {
  return JSON.stringify(removeReservedKeysFromDocument(document), null, 2);
}
export async function generateContentFromMarkdownDocument(document) {
  const body = document.body.type === "minimark" ? decompressTree(document.body) : document.body;
  visit(body, (node) => node.type === "element" && node.tag === "a", (node) => {
    Reflect.deleteProperty(node.props, "rel");
  });
  const markdown = await stringifyMarkdown(body, removeReservedKeysFromDocument(document), {
    frontMatter: {
      options: {
        lineWidth: 0
      }
    },
    plugins: {
      remarkMDC: {
        options: {
          autoUnwrap: true
        }
      }
    }
  });
  return typeof markdown === "string" ? markdown.replace(/&#x2A;/g, "*") : markdown;
}
