import type { StudioUser } from 'nuxt-studio/app';
export declare function defineStudioActivationPlugin(onStudioActivation: (user: StudioUser) => Promise<void>): Promise<void>;
