import { eventHandler, useSession, getRequestProtocol } from "h3";
import { useRuntimeConfig, createError } from "#imports";
import components from "#nuxt-component-meta/nitro";
import { highlight } from "#mdc-imports";
import { filterComponents } from "../utils/meta.js";
export default eventHandler(async (event) => {
  const config = useRuntimeConfig();
  if (!import.meta.dev) {
    const session = await useSession(event, {
      name: "studio-session",
      password: config.studio?.auth?.sessionSecret,
      cookie: {
        // Use secure cookies over HTTPS, required for locally testing purposes
        secure: getRequestProtocol(event) === "https",
        path: "/"
      }
    });
    if (!session?.data?.user) {
      throw createError({
        statusCode: 404,
        message: "Not found"
      });
    }
  }
  const mappedComponents = Object.values(components).map(({ pascalName, filePath, meta }) => {
    return {
      name: pascalName,
      path: filePath,
      meta: {
        props: meta.props,
        slots: meta.slots,
        events: meta.events
      }
    };
  });
  const filteredComponents = filterComponents(
    mappedComponents,
    config.studio?.meta?.components
  );
  return {
    markdownConfig: config.studio.markdown || {},
    highlightTheme: highlight?.theme || { default: "github-light", dark: "github-dark", light: "github-light" },
    components: filteredComponents
  };
});
