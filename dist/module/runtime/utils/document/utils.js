import slugify from "slugify";
import { withoutTrailingSlash, withLeadingSlash } from "ufo";
import { pascalCase } from "scule";
import { cleanUrlSegment } from "../url.js";
export function addPageTypeFields(dbItem) {
  const { basename, extension, stem } = parseDocumentId(dbItem.id);
  const filePath = generatePathFromStem(stem);
  return {
    path: filePath,
    ...dbItem,
    title: dbItem.title || generateTitleFromPath(cleanUrlSegment(basename)),
    stem,
    extension
  };
}
export function generateTitleFromPath(path) {
  return path.split(/[\s-]/g).map(pascalCase).join(" ");
}
export function generateStemFromId(id) {
  return id.split("/").slice(1).join("/").split(".").slice(0, -1).join(".");
}
export function generatePathFromStem(stem) {
  stem = stem.split("/").map((part) => slugify(cleanUrlSegment(part), { lower: true })).join("/");
  return withLeadingSlash(withoutTrailingSlash(stem));
}
export function parseDocumentId(id) {
  const [source, ...parts] = id.split(/[:/]/);
  const [, basename, extension] = parts[parts.length - 1]?.match(/(.*)\.([^.]+)$/) || [];
  if (basename) {
    parts[parts.length - 1] = basename;
  }
  const stem = (parts || []).join("/");
  return {
    source,
    stem,
    extension,
    basename: basename || ""
  };
}
export function getFileExtension(id) {
  return id.split("#")[0]?.split(".").pop().toLowerCase();
}
