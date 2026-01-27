export const omit = (obj, keys) => {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)));
};
export const pick = (obj, keys) => {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)));
};
export function doObjectsMatch(base, target) {
  if (typeof base !== "object" || typeof target !== "object") {
    const _base = base === "" ? void 0 : base;
    const _target = target === "" ? void 0 : target;
    return _base === _target;
  }
  if (Array.isArray(base) && Array.isArray(target)) {
    if (base.length !== target.length) {
      return false;
    }
    for (let index = 0; index < base.length; index++) {
      const item = base[index];
      const targetItem = target[index];
      if (!doObjectsMatch(item, targetItem)) {
        return false;
      }
    }
    return true;
  }
  for (const key in base) {
    if (!doObjectsMatch(base[key], target[key])) {
      return false;
    }
  }
  return true;
}
