// Import Dependencies
import Head from "next/head";
import { type NextPage } from "next";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
// Define Page
const Pool: NextPage = () => {
    return (
        <>
            <Head>
                <title>Porquinho: </title>
            </Head>
            <Header />
            <main className="mx-auto max-w-7xl pb-8 sm:min-h-[calc(100vh-9.5rem)]"></main>
            <Footer />
        </>
    );
};
// Export Page
export default Pool;
// Export Server Side Functions
