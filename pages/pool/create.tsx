// Import Dependencies
import Head from "next/head";
import { type NextPage } from "next";
import {
    type Dispatch,
    type SetStateAction,
    type ChangeEvent,
    type FormEvent,
    useEffect,
    useState,
} from "react";
import CurrencyInput from "react-currency-input-field";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { useQuill } from "react-quilljs";
import Delta from "quill-delta";
import { imageHandler } from "../../lib/quill/imageHandler";
import axios from "axios";
// Define Page
const Pool: NextPage = () => {
    // Define Editor
    const { quill, quillRef } = useQuill({
        placeholder:
            "Explique aqui o porquê de você estar fazendo esta vaquinha.",
        modules: {},
    });
    // Define State
    const [title, setTitle] = useState("");
    const [goal, setGoal] = useState(1);
    // Define Handlers
    useEffect(() => {
        quill?.getModule("toolbar").addHandler("image", imageHandler(quill));
        quill?.on("text-change", (delta) => {
            console.log(delta);
        });
    }, [quill]);
    const handleFormStateUpdate = (
        stateUpdater: Dispatch<SetStateAction<string>>,
        trim = true
    ) => {
        return (event: ChangeEvent<HTMLInputElement>) =>
            stateUpdater(trim ? event.target.value.trim() : event.target.value);
    };
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        // Prevent Default
        event.preventDefault();
        // Check Requirements
        if (goal < 1) {
            // Notify User
            alert("Meta não pode ser menor que 1 satoshi");
            // Clear Fields
            setTitle("");
            setGoal(1);
            quill?.setContents(new Delta());
            return;
        }
        // Get Quill Data
        const quillDelta = quill?.getContents() || new Delta();
        // Build Payload
        const payload = {
            title,
            goal,
            description: quillDelta,
        };
        // Send Request
        const req = axios.post(
            new URL("/api/pool", location.toString()).toString(),
            payload
        );
        req.then((res) => console.log(res.request)).catch((error) =>
            console.log(error)
        );
    };
    // Define Rendering
    return (
        <>
            <Head>
                <title>Criar porquinho: {title}</title>
            </Head>
            <Header />
            <main className="mx-auto max-w-7xl py-8 sm:min-h-[calc(100vh-9.5rem)]">
                <section className="px-8 py-4 w-full grid grid-cols-1 gap-4 bg-white rounded-lg drop-shadow">
                    <h1 className="block font-fm-primary text-2xl font-bold">
                        Crie um porquinho
                    </h1>
                    <form
                        className="font-fm-primary grid grid-cols-2 gap-4"
                        onSubmit={handleSubmit}
                    >
                        <fieldset
                            name="title"
                            className="space-y-2"
                            style={{ gridColumn: "1" }}
                        >
                            <legend className="font-bold text-lg">
                                Título
                            </legend>
                            <input
                                type="text"
                                className="px-4 h-9 w-full border border-solid border-gray-300 rounded-lg"
                                placeholder="Título do porquinho"
                                required
                                value={title}
                                onChange={handleFormStateUpdate(setTitle)}
                            />
                        </fieldset>
                        <fieldset
                            name="goal"
                            className="space-y-2"
                            style={{ gridColumn: "2" }}
                        >
                            <legend className="font-bold text-lg">Meta</legend>
                            <CurrencyInput
                                className="px-4 h-9 w-full border border-solid border-gray-300 rounded-lg"
                                placeholder="Sua meta em satoshis"
                                required
                                prefix="ș "
                                decimalsLimit={0}
                                min={1}
                                value={goal}
                                onValueChange={(value, name, values) =>
                                    setGoal(Number(values?.value || "0"))
                                }
                            />
                        </fieldset>
                        <fieldset
                            name="description"
                            className="space-y-2"
                            style={{ gridColumn: "1 / 2 span" }}
                        >
                            <legend className="font-bold text-lg">
                                Descrição
                            </legend>
                            <div>
                                <div ref={quillRef}></div>
                            </div>
                        </fieldset>
                        <button
                            className="ml-auto w-full max-w-xs h-12 text-2xl text-white font-bold rounded-lg bg-[#F9A195]"
                            style={{ gridColumn: "2" }}
                            type="submit"
                        >
                            Salvar
                        </button>
                    </form>
                </section>
            </main>
            <Footer />
        </>
    );
};
// Export Page
export default Pool;
// Export Server Side Functions
