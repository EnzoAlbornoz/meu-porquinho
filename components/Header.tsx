// Import Dependencies
import { createElement, FunctionComponent } from "react";
import Link from "next/link";
import PigSvg from "../assets/piggy-bank.svg";
// Export Component
export const Header: FunctionComponent = (props) => {
    // Define Render
    return (
        <header className="h-12 sm:h-24 bg-white">
            <nav className="px-3 sm:px-14 mx-auto w-full h-full max-w-5xl flex justify-between space-x-9">
                <Link href="/" passHref>
                    <section className="flex space-x-4 hover:cursor-pointer">
                        <PigSvg className="w-8 sm:w-16"></PigSvg>
                        <h5 className="text-lg sm:text-4xl my-auto font-fm-display">
                            Meu Porquinho
                        </h5>
                    </section>
                </Link>
                <section className="flex-grow flex">
                    <input
                        className="w-full h-9 px-4 my-auto bg-white border border-solid border-[#BBBBBB] rounded-lg font-fm-primary"
                        placeholder="🔍 Buscar"
                    ></input>
                </section>
                <section className="flex sm:space-x-9">
                    <Link href="/login" passHref>
                        <a className="my-auto text-[#F9A195] text-xl font-bold rounded-lg hover:cursor-pointer font-fm-primary">
                            Entrar
                        </a>
                    </Link>
                    <Link href="/register" passHref>
                        <a className="my-auto py-2 px-3 bg-[#F9A195] text-white text-xl font-bold rounded-lg hover:cursor-pointer font-fm-primary">
                            Registrar
                        </a>
                    </Link>
                </section>
            </nav>
        </header>
    );
};
