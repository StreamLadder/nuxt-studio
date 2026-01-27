import { withLeadingSlash, withoutLeadingSlash, withoutTrailingSlash } from "ufo";
import { join } from "pathe";
import { minimatch } from "minimatch";
export function parseSourceBase(source) {
  const [fixPart, ...rest] = source.include.includes("*") ? source.include.split("*") : ["", source.include];
  return {
    fixed: fixPart || "",
    dynamic: "*" + rest.join("*")
  };
}
export function getCollectionSourceById(id, sources) {
  const [_, ...rest] = id.split(/[/:]/);
  const prefixAndPath = rest.join("/");
  const matchedSource = sources.find((source) => {
    const prefix = source.prefix;
    if (!prefix) {
      return false;
    }
    if (!withLeadingSlash(prefixAndPath).startsWith(prefix)) {
      return false;
    }
    let fsPath;
    const [fixPart] = source.include.includes("*") ? source.include.split("*") : ["", source.include];
    const fixed = withoutTrailingSlash(fixPart || "/");
    if (withoutLeadingSlash(fixed) === withoutLeadingSlash(prefix)) {
      fsPath = prefixAndPath;
    } else {
      const path = prefixAndPath.replace(withoutLeadingSlash(prefix), "");
      fsPath = join(fixed, path);
    }
    const include = minimatch(fsPath, source.include, { dot: true });
    const exclude = source.exclude?.some((exclude2) => minimatch(fsPath, exclude2));
    return include && !exclude;
  });
  return matchedSource;
}
