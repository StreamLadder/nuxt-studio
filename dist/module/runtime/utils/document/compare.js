import { ContentFileExtension } from "../../types/content.js";
import { doObjectsMatch } from "../object.js";
import { stringify } from "minimark/stringify";
import { compressTree } from "@nuxt/content/runtime";
import { generateDocumentFromContent } from "./generate.js";
import { removeLastStylesFromTree } from "./tree.js";
export async function isDocumentMatchingContent(content, document) {
  const generatedDocument = await generateDocumentFromContent(document.id, content);
  if (generatedDocument.extension === ContentFileExtension.Markdown) {
    const { body: generatedBody, ...generatedDocumentData } = generatedDocument;
    const { body: documentBody, ...documentData } = document;
    const cleanedGeneratedBody = removeLastStylesFromTree(generatedBody);
    const cleanedDocumentBody = removeLastStylesFromTree(documentBody);
    const generatedBodyStringified = stringify(cleanedGeneratedBody).replace(/\n/g, "");
    const documentBodyStringified = stringify(cleanedDocumentBody).replace(/\n/g, "");
    if (generatedBodyStringified !== documentBodyStringified) {
      return false;
    }
    return doObjectsMatch(generatedDocumentData, documentData);
  }
  return doObjectsMatch(generatedDocument, document);
}
export function areDocumentsEqual(document1, document2) {
  const { body: body1, meta: meta1, ...documentData1 } = document1;
  const { body: body2, meta: meta2, ...documentData2 } = document2;
  if (document1.extension === ContentFileExtension.Markdown) {
    const minifiedBody1 = removeLastStylesFromTree(
      document1.body.type === "minimark" ? document1.body : compressTree(document1.body)
    );
    const minifiedBody2 = removeLastStylesFromTree(
      document2.body.type === "minimark" ? document2.body : compressTree(document2.body)
    );
    if (stringify(minifiedBody1) !== stringify(minifiedBody2)) {
      return false;
    }
  } else if (typeof body1 === "object" && typeof body2 === "object") {
    if (!doObjectsMatch(body1, body2)) {
      return false;
    }
  } else {
    if (JSON.stringify(body1) !== JSON.stringify(body2)) {
      return false;
    }
  }
  function refineDocumentData(doc) {
    if (doc.seo) {
      const seo = doc.seo;
      doc.seo = {
        ...seo,
        title: seo.title || doc.title,
        description: seo.description || doc.description
      };
    }
    Reflect.deleteProperty(doc, "__hash__");
    Reflect.deleteProperty(doc, "path");
    if (typeof doc.navigation === "undefined") {
      doc.navigation = true;
    }
    for (const key in doc) {
      const value = doc[key];
      if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
        if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
          doc[key] = new Date(value).toISOString().split("T")[0];
        }
      }
    }
    function removeNullAndUndefined(obj) {
      const result = {};
      for (const key in obj) {
        const value = obj[key];
        if (value === null || value === void 0) {
          continue;
        }
        if (typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
          result[key] = removeNullAndUndefined(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    }
    return removeNullAndUndefined(doc);
  }
  const data1 = refineDocumentData({ ...documentData1, ...meta1 || {} });
  const data2 = refineDocumentData({ ...documentData2, ...meta2 || {} });
  if (!doObjectsMatch(data1, data2)) {
    return false;
  }
  return true;
}
