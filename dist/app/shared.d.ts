import { CollectionType } from '@nuxt/content';
import { ComponentData } from 'nuxt-component-meta';
import { Nodes } from 'mdast';

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

export declare const EMOJI_REGEXP: RegExp;

export declare interface EmojiItem {
    name: string;
    shortcodes: string[];
    group: string;
    version: number;
    emoticons?: string[];
}

export declare const emojiList: Record<string, EmojiItem>;

export declare const emojiNameToUnicodeMap: Map<string, string>;

export declare function getEmojiName(unicode: string): string;

export declare function getEmojiUnicode(name: string): string;

export declare type GitProviderType = 'github' | 'gitlab';

export declare interface MarkdownParsingOptions {
    compress?: boolean;
    collectionType?: CollectionType;
}

export declare function remarkEmojiPlugin(): (tree: Nodes) => void;

export declare const VirtualMediaCollectionName: "public-assets";

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
        imagePicker: {
            insertImagePicker: () => ReturnType;
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
