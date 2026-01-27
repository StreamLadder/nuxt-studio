import type { ComponentMeta } from 'nuxt-studio/app';
export declare function filterComponents<T extends ComponentMeta>(components: T[], options: {
    include?: string[];
    exclude?: string[];
}): T[];
