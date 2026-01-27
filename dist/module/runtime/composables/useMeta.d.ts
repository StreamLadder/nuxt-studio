import type { ComponentMeta } from 'nuxt-studio/app';
export declare const useHostMeta: () => {
    fetch: () => Promise<void>;
    components: import("vue").ShallowRef<ComponentMeta[], ComponentMeta[]>;
    highlightTheme: import("vue").ShallowRef<{
        default: string;
        dark?: string;
        light?: string;
    } | undefined, {
        default: string;
        dark?: string;
        light?: string;
    } | undefined>;
    markdownConfig: import("vue").ShallowRef<{
        contentHeading?: boolean;
    } | undefined, {
        contentHeading?: boolean;
    } | undefined>;
};
