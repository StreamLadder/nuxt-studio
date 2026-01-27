import { getAppManifest, useState, useRuntimeConfig, useCookie } from "#imports";
export async function defineStudioActivationPlugin(onStudioActivation) {
  const user = useState("studio-session", () => null);
  const config = useRuntimeConfig().public.studio;
  const cookie = useCookie("studio-session-check");
  if (config.dev) {
    return await onStudioActivation({
      provider: "github",
      email: "dev@nuxt.com",
      name: "Dev",
      accessToken: "",
      providerId: "",
      avatar: ""
    });
  }
  user.value = String(cookie.value) === "true" ? await $fetch("/__nuxt_studio/auth/session").then((session) => session?.user ?? null) : null;
  let mounted = false;
  if (user.value?.email) {
    const manifest = await getAppManifest();
    manifest.prerendered = [];
    await onStudioActivation(user.value);
    mounted = true;
  } else if (mounted) {
    window.location.reload();
  } else {
    document.addEventListener("keydown", (event) => {
      if (event.metaKey && event.key === ".") {
        setTimeout(() => {
          window.location.href = config.route + "?redirect=" + encodeURIComponent(window.location.pathname);
        });
      }
    });
  }
}
