import { minimatch } from "minimatch";
export function filterComponents(components, options) {
  const { include = [], exclude = [] } = options;
  if (components.length === 0) {
    return [];
  }
  let result = components;
  if (include.length > 0) {
    result = result.filter((component) => matchAnyPattern(component, include));
  }
  if (exclude.length > 0) {
    result = result.filter((component) => !matchAnyPattern(component, exclude));
  }
  return result;
}
function matchAnyPattern(component, patterns) {
  return patterns.some((pattern) => {
    const value = pattern.includes("/") ? component.path : component.name;
    return minimatch(value, pattern);
  });
}
