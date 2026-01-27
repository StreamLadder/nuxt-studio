import { defineNuxtPlugin, useRuntimeConfig } from "#imports";
import { defineStudioActivationPlugin } from "../utils/activation.js";
export default defineNuxtPlugin(() => {
  defineStudioActivationPlugin(async (user) => {
    const config = useRuntimeConfig();
    const host = await (config.public.studio.dev ? import("../host.dev") : import("../host")).then((m) => m.useStudioHost);
    window.useStudioHost = () => host(user, config.public.studio.repository);
    await import("nuxt-studio/app");
    document.body.appendChild(document.createElement("nuxt-studio"));
  });
});
