import axios, { AxiosError, AxiosResponse } from "axios";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
    type ChangeEvent,
    type Dispatch,
    type SetStateAction,
    useState,
    FormEvent,
    useMemo,
} from "react";
import { Card } from "../components/Card";
import { Header } from "../components/Header";

const Login: NextPage = () => {
    // Define State
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isRequesting, setRequesting] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    // Define Handlers
    const handleFormStateUpdate = (
        stateUpdater: Dispatch<SetStateAction<string>>,
        trim = true
    ) => {
        return (event: ChangeEvent<HTMLInputElement>) => {
            setErrorMessage(null);
            stateUpdater(trim ? event.target.value.trim() : event.target.value);
        };
    };
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        // Prevent Reload
        event.preventDefault();
        // Start Loading
        setRequesting(true);
        // Submit Data
        console.log(username, password);
        axios
            .post("/api/user/login", {
                username,
                password,
            })
            .then(
                (
                    res: AxiosResponse<{
                        status: string;
                        message: string;
                        data: {
                            id: string;
                            token: string;
                            walletToken: string;
                        };
                    }>
                ) => {
                    // Store Token
                    localStorage.setItem("jwt", res.data.data.token);
                    // Redirect to Home
                    router.push("/");
                }
            )
            .catch(
                (
                    error: AxiosError<{
                        status: string;
                        message: string;
                        data: null;
                    }>
                ) => {
                    // Switch Error and Show Error
                    switch (error.code) {
                        case "404":
                            setErrorMessage("Usuário inválido");
                        case "401":
                            setErrorMessage("Senha incorreta");
                        default:
                            setErrorMessage("Um erro desconhecido aconteceu");
                            break;
                    }
                    console.error(error);
                }
            )
            .finally(() => setRequesting(false));
    };
    // Define SubRender
    const errorDisplay = useMemo(() => {
        if (!errorMessage) {
            return (
                <div className="text-center text-red-500 text-bold transition-all dtransition-all duration-500 ease-out transform-gpu scale-y-0"></div>
            );
        }
        return (
            <div className="mt-4 -mb-4 text-center text-red-500 text-bold transition-all duration-500 ease-out transform-gpu">
                {errorMessage}
            </div>
        );
    }, [errorMessage]);
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
                            disabled={isRequesting}
                            className="w-full h-10 text-2xl text-white font-bold rounded-lg bg-[#F9A195]"
                            type="submit"
                        >
                            Entrar
                        </button>
                        {errorDisplay}
                    </form>
                    <footer className="mt-4 text-center text-gray-500">
                        Ainda não se cadastrou? Clique{" "}
                        <Link href="/register" passHref>
                            <a className="text-[#F9A195]">aqui</a>
                        </Link>{" "}
                        e cadastre-se já.
                    </footer>
                </section>
            </main>
        </>
    );
};
export default Login;
