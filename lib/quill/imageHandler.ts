// Import Dependencies
import axios from "axios";
import { type Quill } from "quill";
import { RefObject } from "react";
// Define Functions
const handleFileUpload = async (file: File) => {
    // Create Form
    const form = new FormData();
    // Add File
    form.append("file", file);
    console.log(form instanceof FormData);
    console.info(form);
    // Upload It
    const {
        data: [fileId],
    } = await axios.post<Array<string>>(
        new URL("/api/upload", location.toString()).toString(),
        form
    );
    // Return Formatted URL
    return new URL(`/api/upload/${fileId}`, location.toString()).toString();
};
const insertFileToEditor = (uploadUrl: string, editor: Quill | undefined) => {
    editor?.insertEmbed(null as unknown as number, "image", uploadUrl);
};
export const imageHandler = (editor: Quill | undefined) => () => {
    // Create Element to store Image
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    // Choose File
    console.log(editor);

    input.click();
    // Handle File Picking
    input.onchange = async () => {
        // Get a valid image file
        const file = [...(input.files || [])].find((file) =>
            /^image\//.test(file.type)
        );
        // Notify file invalid if file is undefined
        if (!file)
            return alert(
                "Tipo de arquivo inválido. Use apenas imagens, por favor."
            );
        // Upload Image
        insertFileToEditor(await handleFileUpload(file), editor);
    };
};
