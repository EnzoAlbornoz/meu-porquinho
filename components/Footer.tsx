/* eslint-disable @next/next/no-img-element */
// Import Dependencies

import { FunctionComponent } from "react";

// Define Component
export const Footer: FunctionComponent = () => {
    return (
        <footer className="py-4 bg-gray-300">
            <div className="max-w-7xl mx-auto">
                Made by{" "}
                <a
                    href="https://github.com/EnzoAlbornoz"
                    className="font-bold text-gray-700"
                >
                    Enzo Coelho Albornoz
                </a>{" "}
                and{" "}
                <span className="font-bold text-gray-700">
                    Gabriel Soares Flores
                </span>{" "}
                with{" "}
                <img
                    src="/images/nextjs.svg"
                    alt=""
                    className="inline h-4 my-auto mb-1"
                />{" "}
                Next.JS,{" "}
                <img
                    src="/images/tailwindcss.svg"
                    alt=""
                    className="inline h-4 my-auto mb-1"
                />{" "}
                Tailwind CSS and{" "}
                <img
                    src="/images/lightningnetwork.svg"
                    alt=""
                    className="inline h-4 my-auto mb-1"
                />{" "}
                Lightning Network
            </div>
        </footer>
    );
};
