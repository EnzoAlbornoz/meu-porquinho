import "quill/dist/quill.snow.css";
import "../styles/index.css";
import "tailwindcss/tailwind.css";
import type { AppProps } from "next/app";

declare var process: {
    env: {
        NODE_ENV: string;
    };
};

function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}

export default MyApp;
