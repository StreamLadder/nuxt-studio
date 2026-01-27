export declare const serviceWorker: () => string;

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
