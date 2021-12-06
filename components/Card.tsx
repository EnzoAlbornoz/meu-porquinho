// Import Dependencies
import { createElement, FunctionComponent } from "react";
import Link from "next/link";
import Image from "next/image";
// Export Component
export const Card: FunctionComponent<{
    className?: string;
}> = (props) => {
    // Define Render
    return (
        <section className="h-80 w-5/12 bg-gray-300 rounded-lg drop-shadow-md hover:scale-105 transition-transform hover:cursor-pointer overflow-hidden">
            <div className="relative h-32">
                <Image
                    src="/images/placeholder-image.svg"
                    layout="fill"
                    objectFit="cover"
                    alt="Porquinho"
                />
            </div>
            <section className="px-3 py-1 h-full bg-white font-fm-primary">
                <h3 className="mb-1 text-base font-bold">
                    Lorem ipsum dolor sit amet
                </h3>
                <p className="text-sm">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Duis vel feugiat lorem. In eleifend magna ut nulla ornare
                    suscipit. Maecenas vitae ullamcorper eros. Curabitur vitae
                    sem turpis. Sed dolor augue, viverra a massa et, iaculis
                    accumsan tortor. Etiam scelerisque feugiat tincidunt.
                </p>
                <div className="flex justify-between align-bottom">
                    <span className="inline-block text-2xl font-bold text-[#F56956]">
                        85%
                    </span>
                    <span className="inline-block text-base text-black">
                        R$ 4.600 arrecados de R$ 5.138
                    </span>
                </div>
            </section>
        </section>
    );
};
