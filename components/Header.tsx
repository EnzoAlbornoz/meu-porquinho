// Import Dependencies
import {
    type FunctionComponent,
    type MouseEventHandler,
    useMemo,
    useContext,
} from "react";
import Link from "next/link";
import PigSvg from "../assets/piggy-bank.svg";
import SignOutSvg from "../assets/sign-out-alt-solid.svg";
import { useJWTUser } from "../lib/hooks/withJWT";
import { useRouter } from "next/router";
import { SearchContext } from "../lib/context/search";
// Export Component
export const Header: FunctionComponent = (props) => {
    // Define State
    const router = useRouter();
    const { search, setSearch } = useContext(SearchContext);
    const user = useJWTUser();
    const handleExit: MouseEventHandler<HTMLButtonElement> = useMemo(
        () => (event) => {
            // Prevent Default
            event.preventDefault();
            // Flush JWT
            localStorage.removeItem("jwt");
            // Return to Home
            if (router.pathname === "/") {
                router.reload();
            } else {
                router.push("/");
            }
        },
        [router]
    );
    // Define Sub Renders
    const profileHeader = useMemo(() => {
        if (user) {
            return (
                <section className="flex sm:space-x-9">
                    <Link href="/withdraw" passHref>
                        <a className="my-auto text-[#F9A195] text-xl font-bold rounded-lg hover:cursor-pointer font-fm-primary">
                            Sacar
                        </a>
                    </Link>
                    <Link href="/pool/create" passHref>
                        <a className="my-auto py-2 px-3 bg-[#F9A195] text-white text-xl font-bold rounded-lg hover:cursor-pointer font-fm-primary">
                            Criar Porquinho
                        </a>
                    </Link>
                    <span className="inline-block my-auto text-center text-lg font-semibold text-gray-600">
                        {user.username}
                    </span>
                    <button
                        type="button"
                        className="my-auto bg-gray-100 rounded-full p-2 hover:shadow"
                        onClick={handleExit}
                    >
                        <SignOutSvg className="w-6 text-[#F9A195] " />
                    </button>
                </section>
            );
        } else {
            return (
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
            );
        }
    }, [handleExit, user]);
    // Define Render
    return (
        <header className="h-12 sm:h-24 bg-white">
            <nav className="px-3 sm:px-0 mx-auto w-full h-full max-w-7xl flex justify-between space-x-9">
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
                        value={search}
                        onChange={(ev) => setSearch(ev.target.value)}
                    ></input>
                </section>
                {profileHeader}
            </nav>
        </header>
    );
};
