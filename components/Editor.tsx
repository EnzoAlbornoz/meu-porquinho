import { useCallback, useRef } from "react";
import { createReactEditorJS } from "react-editor-js";

const Editor = () => {
    const ReactEditorJS = createReactEditorJS();

    const editorJS = useRef<any | null>(null);

    const handleInitialize = useCallback((instance) => {
        editorJS.current = instance;
    }, []);

    const handleSave = useCallback(async () => {
        const savedData = await editorJS?.current?.save();
    }, []);

    return <ReactEditorJS onInitialize={handleInitialize} />;
};

export default Editor;
