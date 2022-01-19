import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import {
    type ChangeEvent,
    type Dispatch,
    type SetStateAction,
    useState,
    FormEvent,
} from "react";
import { Card } from "../components/Card";
import { Header } from "../components/Header";

const Login: NextPage = () => {
    // Define State
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    // Define Handlers
    const handleFormStateUpdate = (
        stateUpdater: Dispatch<SetStateAction<string>>,
        trim = true
    ) => {
        return (event: ChangeEvent<HTMLInputElement>) =>
            stateUpdater(trim ? event.target.value.trim() : event.target.value);
    };
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        // Prevent Reload
        event.preventDefault();
        // Submit Data
        console.log(username, password);
    };
    // Define Rendering
    return (
        <>
            <Head>
                <title>Entrar</title>
            </Head>
            <main className="w-screen h-screen flex justify-center items-center font-fm-primary">
                <section className="w-full max-w-lg px-9 py-16 rounded-lg bg-white drop-shadow-md">
                    <h1 className="block py-8 text-center text-4xl">
                        Bem vindo de volta!
                    </h1>
                    <form
                        className="py-8 border-b border-solid border-gray-300"
                        onSubmit={handleSubmit}
                    >
                        <fieldset className="mb-4">
                            <legend>Email</legend>
                            <input
                                className="h-9 px-4 w-full rounded-lg border border-solid border-gray-300"
                                type="email"
                                required
                                placeholder="joao.silva@email.com"
                                value={username}
                                onChange={handleFormStateUpdate(setUsername)}
                            />
                        </fieldset>
                        <fieldset className="mb-6">
                            <legend>Senha</legend>
                            <input
                                className="h-9 px-4 w-full rounded-lg border border-solid border-gray-300"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={handleFormStateUpdate(setPassword)}
                            />
                        </fieldset>
                        <button
                            className="w-full h-10 text-2xl text-white font-bold rounded-lg bg-[#F9A195]"
                            type="submit"
                        >
                            Entrar
                        </button>
                    </form>
                    <footer className="mt-8 text-center text-gray-500">
                        Ainda não se cadastrou? Clique{" "}
                        <a className="text-[#F9A195]" href="/register">
                            aqui
                        </a>{" "}
                        e cadastre-se já.
                    </footer>
                </section>
            </main>
        </>
    );
};
export default Login;
