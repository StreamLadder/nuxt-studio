import { createSharedComposable } from "@vueuse/core";
import { shallowRef } from "vue";
import { kebabCase } from "scule";
const defaultMeta = {
  components: [],
  highlightTheme: { default: "github-light", dark: "github-dark" },
  markdownConfig: {}
};
export const useHostMeta = createSharedComposable(() => {
  const components = shallowRef([]);
  const highlightTheme = shallowRef();
  const markdownConfig = shallowRef();
  async function fetch() {
    const data = await $fetch("/__nuxt_studio/meta", {
      headers: { "content-type": "application/json" }
    }).catch(() => defaultMeta);
    highlightTheme.value = data.highlightTheme;
    markdownConfig.value = data.markdownConfig;
    const markdownElements = /* @__PURE__ */ new Set(["h1", "h2", "h3", "h4", "h5", "h6", "a", "p", "li", "ul", "ol", "blockquote", "code", "code-block", "image", "video", "link", "hr", "img", "pre", "em", "bold", "italic", "strike", "strong", "tr", "thead", "tbody", "tfoot", "th", "td"]);
    const renamedComponents = [];
    for (const component of data.components || []) {
      let name = component.name;
      const nuxtUI = component.path.includes("@nuxt/ui");
      if (nuxtUI) {
        component.nuxtUI = true;
        if (component.name.startsWith("Prose")) {
          name = name.slice(5);
        }
        if (component.path.endsWith(".d.vue.ts")) {
          name = name.slice(0, -4);
        }
      }
      renamedComponents.push({
        ...component,
        name
      });
    }
    const processedComponents = /* @__PURE__ */ new Map();
    for (const component of renamedComponents) {
      if (component.nuxtUI && component.name.startsWith("U")) {
        const nameWithoutU = component.name.slice(1);
        if (renamedComponents.find((c) => c.name === nameWithoutU)) continue;
      }
      const kebabName = kebabCase(component.name);
      if (markdownElements.has(kebabName)) continue;
      const existing = processedComponents.get(kebabName);
      if (existing) {
        if (existing.path.endsWith(".d.vue.ts")) {
          continue;
        }
        processedComponents.set(kebabName, {
          ...component,
          name: kebabName
        });
        continue;
      }
      processedComponents.set(kebabName, {
        ...component,
        name: kebabName
      });
    }
    const calloutComponent = processedComponents.get("callout");
    if (calloutComponent?.meta?.props && calloutComponent.nuxtUI) {
      for (const shortcutName of ["tip", "warning", "note", "caution"]) {
        const shortcut = processedComponents.get(shortcutName);
        if (shortcut?.nuxtUI) {
          shortcut.meta.props = [...shortcut.meta.props, ...calloutComponent.meta.props];
        }
      }
    }
    components.value = Array.from(processedComponents.values());
  }
  return {
    fetch,
    components,
    highlightTheme,
    markdownConfig
  };
});
