import { hash } from "ohash";
import { minimatch } from "minimatch";
import { join, dirname, parse } from "pathe";
import { withoutLeadingSlash, withoutTrailingSlash } from "ufo";
import { parseSourceBase } from "./source.js";
export function generateStemFromFsPath(path) {
  return withoutLeadingSlash(join(dirname(path), parse(path).name));
}
export function generateIdFromFsPath(path, collectionInfo) {
  const { fixed } = parseSourceBase(collectionInfo.source[0]);
  const pathWithoutFixed = path.substring(fixed.length);
  return join(collectionInfo.name, collectionInfo.source[0]?.prefix || "", pathWithoutFixed);
}
export function generateFsPathFromId(id, source) {
  const [_, ...rest] = id.split(/[/:]/);
  let path = rest.join("/");
  const { fixed } = parseSourceBase(source);
  const normalizedFixed = withoutTrailingSlash(fixed);
  const prefix = withoutTrailingSlash(withoutLeadingSlash(source.prefix || ""));
  if (prefix && prefix !== "/" && path.startsWith(prefix + "/")) {
    path = path.substring(prefix.length + 1);
  }
  if (normalizedFixed && path.startsWith(normalizedFixed)) {
    return path;
  }
  return join(fixed, path);
}
export function getOrderedSchemaKeys(schema) {
  const shape = Object.values(schema.definitions)[0]?.properties || {};
  const keys = new Set([
    shape.id ? "id" : void 0,
    shape.title ? "title" : void 0,
    ...Object.keys(shape).sort()
  ].filter(Boolean));
  return Array.from(keys);
}
export function getCollectionByFilePath(path, collections) {
  let matchedSource;
  const sortedCollections = Object.values(collections).sort((a, b) => {
    return (b.source[0]?.prefix?.length || 0) - (a.source[0]?.prefix?.length || 0);
  });
  const collection = sortedCollections.find((collection2) => {
    if (!collection2.source || collection2.source.length === 0) {
      return;
    }
    const paths = path === "/" ? ["index.yml", "index.yaml", "index.md", "index.json"] : [path];
    return paths.some((p) => {
      matchedSource = collection2.source.find((source) => {
        const include = minimatch(p, source.include, { dot: true });
        const exclude = source.exclude?.some((exclude2) => minimatch(p, exclude2));
        return include && !exclude;
      });
      return matchedSource;
    });
  });
  return collection;
}
export function getCollectionById(id, collections) {
  const collectionName = id.split(/[/:]/)[0];
  const collection = collections[collectionName];
  if (!collection) {
    throw new Error(`Collection ${collectionName} not found`);
  }
  return collection;
}
function computeValuesBasedOnCollectionSchema(collection, data) {
  const fields = [];
  const values = [];
  const properties = collection.schema.definitions[collection.name].properties;
  const sortedKeys = getOrderedSchemaKeys(collection.schema);
  sortedKeys.forEach((key) => {
    const value = properties[key];
    const type = collection.fields[key];
    const defaultValue = value?.default !== void 0 ? value.default : "NULL";
    const valueToInsert = typeof data[key] !== "undefined" ? data[key] : defaultValue;
    fields.push(key);
    if (type === "json") {
      values.push(`'${JSON.stringify(valueToInsert).replace(/'/g, "''")}'`);
    } else if (type === "string" || ["string", "enum"].includes(value.type)) {
      if (["data", "datetime"].includes(value.format)) {
        values.push(valueToInsert !== "NULL" ? `'${new Date(valueToInsert).toISOString()}'` : defaultValue);
      } else {
        values.push(`'${String(valueToInsert).replace(/\n/g, "\\n").replace(/'/g, "''")}'`);
      }
    } else if (type === "boolean") {
      values.push(valueToInsert !== "NULL" ? !!valueToInsert : valueToInsert);
    } else {
      values.push(valueToInsert);
    }
  });
  values.push(`'${hash(values)}'`);
  return values;
}
export function generateRecordInsert(collection, data) {
  const values = computeValuesBasedOnCollectionSchema(collection, data);
  let index = 0;
  return `INSERT INTO ${collection.tableName} VALUES (${"?, ".repeat(values.length).slice(0, -2)})`.replace(/\?/g, () => values[index++]);
}
export function generateRecordDeletion(collection, id) {
  return `DELETE FROM ${collection.tableName} WHERE id = '${id}';`;
}
