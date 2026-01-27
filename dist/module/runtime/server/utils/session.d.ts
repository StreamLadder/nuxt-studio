import type { H3Event } from 'h3';
import type { StudioUser, GitProviderType } from 'nuxt-studio/app';
interface StudioUserSession {
    name: string;
    email: string;
    providerId?: string;
    avatar?: string;
}
export declare function setStudioUserSession(event: H3Event, userSession: StudioUserSession): Promise<void>;
export declare function setInternalStudioUserSession(event: H3Event, user: StudioUser): Promise<{
    id: string;
    user: {
        providerId?: string;
        accessToken: string;
        name: string;
        avatar?: string;
        email: string;
        provider: GitProviderType | "google";
    };
}>;
export declare function clearStudioUserSession(event: H3Event): Promise<{
    loggedOut: boolean;
}>;
export {};
