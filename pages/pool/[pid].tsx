// Import Dependencies
import Head from "next/head";
import { type NextPage, type GetServerSideProps } from "next";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { MouseEventHandler, useEffect, useMemo, useState } from "react";
import { PrivatePool, type PublicPool } from "../../lib/interfaces/Pool";
import { getDb } from "../../lib/api/mongodb";
import Delta from "quill-delta";
import { ObjectId } from "mongodb";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import SatRegEps from "../../assets/sat-reg-eps.svg";
import SatRegBlack from "../../assets/sat-reg-black.svg";
import { DbUser } from "../../lib/interfaces/User";
import { DbDonation } from "../../lib/interfaces/Donation";
import CurrencyInput from "react-currency-input-field";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/router";
// Define Types
interface PoolPageProps {
    pool: PublicPool<true>;
    raised?: number;
    supporters?: number;
}
// Define Page
const Pool: NextPage<PoolPageProps> = ({
    pool,
    raised = 0,
    supporters = 0,
}) => {
    // Define State
    const router = useRouter();
    const [isRequesting, setIsRequesting] = useState(false);
    const [donationAmount, setDonationAmount] = useState(0);
    // Fetch Data
    const goalString = useMemo(
        () => Intl.NumberFormat("pt-BR", {}).format(pool.goal),
        [pool.goal]
    );
    const raisedString = useMemo(
        () => Intl.NumberFormat("pt-BR", {}).format(raised),
        [raised]
    );
    // Define Handlers
    const handleDonation: MouseEventHandler<HTMLButtonElement> = (event) => {
        // Prevent Default
        event.preventDefault();
        // Start Donation
        if (donationAmount > 0) {
            setIsRequesting(true);
            axios
                .post("/api/donation", {
                    poolId: pool.id,
                    amount: donationAmount,
                })
                .then(
                    (
                        res: AxiosResponse<{
                            status: "success";
                            message: string;
                            data: {
                                id: string;
                                invoice: string;
                            };
                        }>
                    ) => {
                        router.push(`/donation/${res.data.data.id}`);
                    }
                )
                .finally(() => setIsRequesting(false));
        }
    };
    // Define SubRender
    const renderedDescription = useMemo(() => {
        const ops = Array.isArray(pool.description)
            ? pool.description
            : pool.description.ops;
        const converter = new QuillDeltaToHtmlConverter(ops, {});
        return (
            <article
                dangerouslySetInnerHTML={{ __html: converter.convert() }}
                className="font-fm-primary"
            ></article>
        );
    }, [pool.description]);
    // Define SubRender
    return (
        <>
            <Head>
                <title>Porquinho: {pool.title}</title>
            </Head>
            <Header />
            <main className="mx-auto max-w-7xl pb-8 pt-4 sm:min-h-[calc(100vh-9.5rem)] font-fm-primary">
                <div className="px-8 py-6 bg-white grid grid-cols-1 sm:grid-cols-3 auto-rows-auto gap-4 rounded-lg drop-shadow">
                    <section className="py-4 sm:col-span-3 text-center">
                        <h1 className="text-4xl font-bold">{pool.title}</h1>
                        <h2>Criado por: {pool.creator}</h2>
                    </section>
                    <section className="sm:col-span-2 py-4">
                        <span className="inline-block text-2xl font-semibold">
                            Descrição
                        </span>
                        <hr className="mb-6 mt-2 rounded" />
                        {renderedDescription}
                    </section>
                    <section className="row-start-2 sm:row-auto sm:col-span-1">
                        {/* <aside className="px-8 py-6 space-y-10 shadow rounded-lg border border-solid border-gray-100"> */}
                        <aside className="px-8 py-6 space-y-10">
                            <div>
                                <span className="text-2xl">Arrecadado</span>
                                <div className="my-2 flex space-x-2">
                                    <SatRegBlack className="w-8 inline-block my-auto" />
                                    <span className="w-8 inline-block my-auto text-2xl">
                                        {raisedString}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-xl">Meta</span>
                                <div className="my-2 flex space-x-2">
                                    <SatRegBlack className="w-8 inline-block my-auto" />
                                    <span className="w-8 inline-block my-auto text-xl">
                                        {goalString}
                                    </span>
                                </div>
                            </div>
                            <div className="">
                                <span className="text-lg">Apoiadores</span>
                                <span className="block my-2">{supporters}</span>
                            </div>
                            <div className="flex flex-col space-y-4">
                                <fieldset className="space-y-1">
                                    <legend className="">
                                        Contribuir com :
                                    </legend>
                                    <CurrencyInput
                                        className="px-4 h-12 w-full border border-solid border-gray-300 rounded-lg"
                                        placeholder="Sua meta em satoshis"
                                        required
                                        prefix="ș "
                                        decimalsLimit={0}
                                        min={1}
                                        value={donationAmount}
                                        onValueChange={(value, name, values) =>
                                            setDonationAmount(
                                                Number(values?.value || "0")
                                            )
                                        }
                                    />
                                </fieldset>
                                <button
                                    disabled={isRequesting}
                                    type="button"
                                    className="mx-auto px-6 py-3 w-full flex justify-center space-x-4 bg-[#F9A195] text-white rounded-lg hover:drop-shadow"
                                    onClick={handleDonation}
                                >
                                    <SatRegEps className="inline-block w-8 my-auto" />
                                    <span className="inline-block font text-xl my-auto">
                                        Contribuir
                                    </span>
                                </button>
                            </div>
                        </aside>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
};
// Export Page
export default Pool;
// Define Types

// Export Server Side Functions
export const getServerSideProps: GetServerSideProps<
    PoolPageProps,
    { pid: string }
> = async (context) => {
    // Get params
    const poolId = context.params?.pid;
    // Param guard
    if (!poolId) return { notFound: true };
    // Fetch pool
    const db = await getDb();
    const pooDocl = await db.collection<PrivatePool>("pools").findOne({
        _id: new ObjectId(poolId),
    });
    const creatorDocl = await db.collection<DbUser>("users").findOne({
        _id: new ObjectId(pooDocl?.creator),
    });
    // Check found
    if (!pooDocl) return { notFound: true };
    // Preprocess data
    const pool: PublicPool<true> = {
        id: poolId,
        title: pooDocl.title,
        description: pooDocl.description,
        goal: pooDocl.goal,
        creator: creatorDocl?.username || "Desconhecido",
        meta: {
            createdAt: pooDocl.meta.createdAt.toISOString(),
            updatedAt: pooDocl.meta.updatedAt.toISOString(),
        },
    };
    // Get Donations
    const donations = await db
        .collection<DbDonation>("donations")
        .find({
            pool: new ObjectId(poolId),
            paid: true,
        })
        .toArray();
    const { raised, supporters } = donations.reduce(
        ({ raised, supporters }, { amount }) => ({
            raised: raised + amount,
            supporters: supporters + 1,
        }),
        { raised: 0, supporters: 0 }
    );
    // Return data
    return {
        props: { pool, raised, supporters },
    };
};
