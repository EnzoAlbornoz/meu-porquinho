// Import Dependencies
import {
    createElement,
    FunctionComponent,
    MouseEventHandler,
    useMemo,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
// Export Component
export const Card: FunctionComponent<{
    className?: string;
    id: string;
    title: string;
    description: string;
    goal: number;
    achieved: number;
}> = ({ id, title, description, goal, achieved }) => {
    // Define Hooks
    const router = useRouter();
    // Compute percentages
    const achievedRatio = useMemo(() => {
        const ratio = achieved / goal;
        return ratio;
    }, [goal, achieved]);
    const achievedPercentage = useMemo(
        () => (achievedRatio * 100).toFixed(0),
        [achievedRatio]
    );
    // Define Handlers
    const handleClick: MouseEventHandler<HTMLElement> = (event) => {
        // Prevent Default
        event.preventDefault();
        // Go to Pool Page
        router.push(`/pool/${id}`);
    };
    // Define Render
    return (
        <section
            className="w-full max-w-sm bg-gray-300 rounded-lg drop-shadow-md hover:scale-105 transition-transform hover:cursor-pointer overflow-hidden"
            onClick={handleClick}
        >
            <div className="relative h-32">
                <Image
                    src="/images/placeholder-image.svg"
                    layout="fill"
                    objectFit="cover"
                    alt="Porquinho"
                />
            </div>
            <section className="px-3 py-3 h-full bg-white font-fm-primary space-y-1">
                <h3 className="text-base font-bold">{title}</h3>
                <p
                    className="text-sm h-[7.5rem] overflow-ellipsis overflow-hidden"
                    style={{
                        display: "-webkit-box",
                        lineClamp: 6,
                        WebkitLineClamp: 6,
                        WebkitBoxOrient: "vertical",
                    }}
                >
                    {description}
                </p>
                <div className="flex justify-between align-baseline items-end">
                    <span className="text-2xl font-bold text-[#F56956]">
                        {achievedPercentage}%
                    </span>
                    <span className="text-base text-black">
                        R$ {achieved} arrecados de R$ {goal}
                    </span>
                </div>
                <div className="h-4 w-full rounded-lg bg-gray-200 border border-solid border-gray-400 border-opacity-75">
                    <div
                        className="h-full rounded-lg bg-gradient-to-r from-[#FFEFF4] to-[#F9A195]"
                        style={{ width: `${achievedRatio * 100}%` }}
                    ></div>
                </div>
            </section>
        </section>
    );
};
