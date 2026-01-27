import { type H3Event } from 'h3';
export interface RequestAccessTokenResponse {
    access_token?: string;
    scope?: string;
    token_type?: string;
    error?: string;
    error_description?: string;
    error_uri?: string;
}
export interface RequestAccessTokenOptions {
    headers?: Record<string, string>;
    body?: Record<string, string>;
    params?: Record<string, string>;
}
export declare function requestAccessToken(url: string, options: RequestAccessTokenOptions): Promise<RequestAccessTokenResponse>;
export declare function generateOAuthState(event: H3Event): Promise<string>;
export declare function validateOAuthState(event: H3Event, receivedState: string): void;
