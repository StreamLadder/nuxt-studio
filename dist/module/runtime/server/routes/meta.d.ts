import type { ComponentMeta as VueComponentMeta } from 'vue-component-meta';
import type { ComponentMeta } from 'nuxt-studio/app';
export interface NuxtComponentMeta {
    pascalName: string;
    filePath: string;
    meta: VueComponentMeta;
    global: boolean;
}
declare const _default: import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<{
    markdownConfig: any;
    highlightTheme: any;
    components: ComponentMeta[];
}>>;
export default _default;
