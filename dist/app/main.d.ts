import { CollectionInfo } from '@nuxt/content';
import { CollectionItemBase } from '@nuxt/content';
import { CollectionType } from '@nuxt/content';
import { ComponentData } from 'nuxt-component-meta';
import { DataCollectionItemBase } from '@nuxt/content';
import { JSType } from 'untyped';
import { PageCollectionItemBase } from '@nuxt/content';
import { RouteLocationNormalized } from 'vue-router';

export declare type ActionHandlerParams = {
    [StudioItemActionId.CreateDocumentFolder]: CreateFolderParams;
    [StudioItemActionId.CreateMediaFolder]: CreateFolderParams;
    [StudioItemActionId.CreateDocument]: CreateFileParams;
    [StudioItemActionId.UploadMedia]: UploadMediaParams;
    [StudioItemActionId.RevertItem]: TreeItem;
    [StudioItemActionId.RenameItem]: TreeItem | RenameFileParams;
    [StudioItemActionId.DeleteItem]: TreeItem;
    [StudioItemActionId.DuplicateItem]: TreeItem;
    [StudioItemActionId.RevertAllItems]: never;
    [StudioBranchActionId.PublishBranch]: PublishBranchParams;
};

export declare enum AudioFileExtension {
    MP3 = "mp3",
    WAV = "wav",
    OGG = "ogg",
    M4A = "m4a",
    AAC = "aac",
    FLAC = "flac"
}

export declare interface BaseItem {
    id: string;
    fsPath?: string;
    extension: string;
    stem: string;
    path?: string;
}

export declare interface CommitFilesOptions extends GitBaseOptions {
    files: RawFile[];
    message: string;
}

export declare interface CommitResult {
    success: boolean;
    commitSha: string;
    url: string;
}

export declare interface ComponentMeta {
    name: string;
    path: string;
    nuxtUI?: boolean;
    meta: {
        props: ComponentData['meta']['props'];
        slots: ComponentData['meta']['slots'];
        events: ComponentData['meta']['events'];
    };
}

export declare interface ContentConflict {
    remoteContent: string;
    localContent: string;
}

export declare enum ContentFileExtension {
    Markdown = "md",
    YAML = "yaml",
    YML = "yml",
    JSON = "json"
}

export declare interface CreateFileParams {
    fsPath: string;
    content: string;
}

export declare interface CreateFolderParams {
    fsPath: string;
}

export declare interface DatabaseDataItem extends DataCollectionItemBase, BaseItem {
    [key: string]: unknown;
}

export declare interface DatabaseItem extends CollectionItemBase, BaseItem {
    [key: string]: unknown;
}

export declare interface DatabasePageItem extends PageCollectionItemBase, BaseItem {
    path: string;
    [key: string]: unknown;
}

declare const _default: {};
export default _default;

export declare interface DraftItem<T = DatabaseItem | MediaItem> {
    fsPath: string;
    status: DraftStatus;
    remoteFile?: GitFile;
    original?: T;
    modified?: T;
    /**
     * - Buffer media content
     */
    raw?: string | Buffer;
    /**
     * Version of the draft
     * Incremented when the draft is updated
     * Used to detect changes when the draft is saved
     */
    version?: number;
    /**
     * Content conflict detection
     */
    conflict?: ContentConflict;
}

export declare enum DraftStatus {
    Deleted = "deleted",
    Created = "created",
    Updated = "updated",
    Pristine = "pristine"
}

export declare type EditorMode = 'code' | 'tiptap';

export declare interface ExtensionConfig {
    allowed: string[];
    default?: string;
    editable: boolean;
}

export declare type FormInputsTypes = JSType | 'icon' | 'media' | 'file' | 'date' | 'datetime' | 'textarea';

export declare type FormItem = {
    id: string;
    type: FormInputsTypes;
    key?: string;
    value?: unknown;
    default?: unknown;
    options?: string[];
    title: string;
    icon?: string;
    children?: FormTree;
    disabled?: boolean;
    hidden?: boolean;
    toggleable?: boolean;
    custom?: boolean;
    arrayItemForm?: FormItem;
};

export declare type FormTree = Record<string, FormItem>;

export declare interface GitBaseOptions {
    owner: string;
    repo: string;
    branch: string;
    authorName: string;
    authorEmail: string;
}

export declare interface GitFile {
    provider: GitProviderType;
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    content?: string;
    encoding?: 'utf-8' | 'base64';
}

export declare interface GithubFile extends GitFile {
    html_url: string;
    git_url: string;
    download_url: string;
    type: string;
    _links: {
        self: string;
        git: string;
        html: string;
    };
}

export declare interface GitLabFile extends GitFile {
    file_path: string;
    ref: string;
    blob_id: string;
    commit_id: string;
    last_commit_id: string;
}

export declare interface GitOptions extends GitBaseOptions {
    provider: GitProviderType | null;
    rootDir: string;
    token: string;
    instanceUrl?: string;
}

export declare interface GitProviderAPI {
    fetchFile(path: string, options?: {
        cached?: boolean;
    }): Promise<GitFile | null>;
    commitFiles(files: RawFile[], message: string): Promise<CommitResult | null>;
    getRepositoryUrl(): string;
    getBranchUrl(): string;
    getCommitUrl(sha: string): string;
    getFileUrl(feature: StudioFeature, fsPath: string): string;
    getRepositoryInfo(): {
        owner: string;
        repo: string;
        branch: string;
        provider: GitProviderType | null;
    };
}

export declare type GitProviderType = 'github' | 'gitlab';

export declare interface I18nConfig {
    strategy?: I18nStrategy;
    defaultLocale?: string;
    locales?: string[];
}

export declare type I18nStrategy = 'no_prefix' | 'prefix_except_default' | 'prefix' | 'prefix_and_default';

export declare enum ImageFileExtension {
    PNG = "png",
    JPG = "jpg",
    JPEG = "jpeg",
    SVG = "svg",
    WEBP = "webp",
    AVIF = "avif",
    ICO = "ico",
    GIF = "gif"
}

export declare interface MarkdownParsingOptions {
    compress?: boolean;
    collectionType?: CollectionType;
}

export declare type MediaFileExtension = ImageFileExtension | AudioFileExtension | VideoFileExtension;

export declare interface MediaItem extends BaseItem {
    [key: string]: unknown;
}

export declare interface PublishBranchParams {
    commitMessage: string;
}

export declare interface RawFile {
    path: string;
    content: string | null;
    status: DraftStatus;
    encoding?: 'utf-8' | 'base64';
}

export declare interface RenameFileParams {
    item: TreeItem;
    newFsPath: string;
}

export declare interface Repository {
    provider: GitProviderType | null;
    owner: string;
    repo: string;
    branch: string;
    rootDir: string;
    /**
     * Can be used to specify the instance URL for self-hosted GitLab instances.
     * @default 'https://gitlab.com'
     */
    instanceUrl?: string;
}

export declare interface StudioAction<K extends StudioItemActionId | StudioBranchActionId> {
    id: K;
    label: string;
    icon: string;
    tooltip: string;
    handler?: (args: ActionHandlerParams[K]) => void;
}

export declare interface StudioActionInProgress {
    id: StudioItemActionId | StudioBranchActionId;
    item?: TreeItem;
}

export declare enum StudioBranchActionId {
    PublishBranch = "publish-branch"
}

export declare interface StudioConfig {
    syncEditorAndRoute: boolean;
    showTechnicalMode: boolean;
    editorMode: EditorMode;
    debug: boolean;
}

export declare enum StudioFeature {
    Content = "content",
    Media = "media"
}

export declare interface StudioHost {
    meta: {
        dev: boolean;
        getComponents: () => ComponentMeta[];
        defaultLocale: string;
        getHighlightTheme: () => SyntaxHighlightTheme;
        i18n?: I18nConfig;
    };
    on: {
        routeChange: (fn: (to: RouteLocationNormalized, from: RouteLocationNormalized) => void) => void;
        mounted: (fn: () => void) => void;
        beforeUnload: (fn: (event: BeforeUnloadEvent) => void) => void;
        colorModeChange: (fn: (colorMode: 'light' | 'dark') => void) => void;
        manifestUpdate: (fn: (id: string) => void) => void;
        documentUpdate: (fn: (fsPath: string, type: 'remove' | 'update') => void) => void;
        mediaUpdate: (fn: (fsPath: string, type: 'remove' | 'update') => void) => void;
        requestDocumentEdit: (fn: (fsPath: string) => void) => void;
    };
    ui: {
        colorMode: 'light' | 'dark';
        activateStudio: () => void;
        deactivateStudio: () => void;
        expandSidebar: () => void;
        collapseSidebar: () => void;
        updateStyles: () => void;
    };
    repository: Repository;
    document: {
        db: {
            get: (fsPath: string) => Promise<DatabaseItem | undefined>;
            list: () => Promise<DatabaseItem[]>;
            upsert: (fsPath: string, document: DatabaseItem) => Promise<void>;
            create: (fsPath: string, content: string) => Promise<DatabaseItem>;
            delete: (fsPath: string) => Promise<void>;
        };
        utils: {
            areEqual: (document1: DatabaseItem, document2: DatabaseItem) => boolean;
            isMatchingContent: (content: string, document: DatabaseItem) => Promise<boolean>;
            pickReservedKeys: (document: DatabaseItem) => DatabaseItem;
            removeReservedKeys: (document: DatabaseItem) => DatabaseItem;
            detectActives: () => Array<{
                fsPath: string;
                title: string;
            }>;
        };
        generate: {
            documentFromContent: (id: string, content: string, options?: MarkdownParsingOptions) => Promise<DatabaseItem | null>;
            contentFromDocument: (document: DatabaseItem) => Promise<string | null>;
        };
    };
    media: {
        get: (fsPath: string) => Promise<MediaItem>;
        list: () => Promise<MediaItem[]>;
        upsert: (fsPath: string, media: MediaItem) => Promise<void>;
        delete: (fsPath: string) => Promise<void>;
    };
    collection: {
        getByFsPath: (fsPath: string) => CollectionInfo | undefined;
    };
    user: {
        get: () => StudioUser;
    };
    app: {
        getManifestId: () => Promise<string>;
        requestRerender: () => void;
        navigateTo: (path: string) => void;
        registerServiceWorker: () => void;
        unregisterServiceWorker: () => void;
    };
}

export declare enum StudioItemActionId {
    CreateDocumentFolder = "create-document-folder",
    CreateMediaFolder = "create-media-folder",
    CreateDocument = "create-document",
    UploadMedia = "upload-media",
    RevertItem = "revert-item",
    RenameItem = "rename-item",
    DeleteItem = "delete-item",
    DuplicateItem = "duplicate-item",
    RevertAllItems = "revert-all-items"
}

export declare interface StudioLocation {
    active: boolean;
    feature: StudioFeature;
    fsPath: string;
}

export declare interface StudioUser {
    providerId?: string;
    accessToken: string;
    name: string;
    avatar?: string;
    email: string;
    provider: GitProviderType | 'google';
}

export declare interface SyntaxHighlightTheme {
    default: string;
    dark?: string;
    light?: string;
}

export declare interface TreeItem {
    name: string;
    fsPath: string;
    type: 'file' | 'directory' | 'root';
    prefix: string | null;
    status?: TreeStatus;
    routePath?: string;
    children?: TreeItem[];
    hide?: boolean;
}

export declare enum TreeStatus {
    Deleted = "deleted",
    Created = "created",
    Updated = "updated",
    Renamed = "renamed",
    Opened = "opened"
}

export declare interface UploadMediaParams {
    parentFsPath: string;
    files: File[];
}

export declare type UseStudioHost = () => StudioHost;

export declare enum VideoFileExtension {
    MP4 = "mp4",
    MOV = "mov",
    AVI = "avi",
    MKV = "mkv",
    WEBM = "webm"
}

export { }


declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        Element: {
            setElement: (tag: string, slot?: string) => ReturnType;
        };
    }
}


declare module '@tiptap/vue-3' {
    interface Commands<ReturnType> {
        videoPicker: {
            insertVideoPicker: () => ReturnType;
        };
    }
}


declare module '@tiptap/vue-3' {
    interface Commands<ReturnType> {
        imagePicker: {
            insertImagePicker: () => ReturnType;
        };
    }
}


declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        Slot: {
            /**
             * Override backspace command
             */
            handleSlotBackspace: () => ReturnType;
        };
    }
}


declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        SpanStyle: {
            /**
             * Wrap selection (or insert empty) with span-style node
             */
            setSpanStyle: (attributes?: SpanStyleAttrs) => ReturnType;
            /**
             * Update attributes on current span-style node
             */
            updateSpanStyle: (attributes?: SpanStyleAttrs) => ReturnType;
            /**
             * Remove the current span-style node (unwrap content)
             */
            unsetSpanStyle: () => ReturnType;
        };
    }
}


declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        InlineElement: {
            /**
             * Toggle a InlineElement
             */
            setInlineElement: (tag: string) => ReturnType;
        };
    }
}


declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        Binding: {
            /**
             * Insert a binding node
             */
            setBinding: (attrs: BindingAttrs) => ReturnType;
            /**
             * Update the current binding node attributes
             */
            updateBinding: (attrs: BindingAttrs) => ReturnType;
            /**
             * Remove current binding node
             */
            unsetBinding: () => ReturnType;
        };
    }
}
