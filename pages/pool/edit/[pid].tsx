// Import Dependencies
import Head from "next/head";
import { GetServerSideProps, type NextPage } from "next";
import {
    type Dispatch,
    type SetStateAction,
    type ChangeEvent,
    type FormEvent,
    useEffect,
    useState,
} from "react";
import CurrencyInput from "react-currency-input-field";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { useQuill } from "react-quilljs";
import Delta from "quill-delta";
import { imageHandler } from "../../../lib/quill/imageHandler";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/router";
import { useJWTUser } from "../../../lib/hooks/withJWT";
import {
    type PrivatePool,
    type PublicPool,
} from "../../../lib/interfaces/Pool";
import { getDb } from "../../../lib/api/mongodb";
import { ObjectId } from "mongodb";
import { type DbUser } from "../../../lib/interfaces/User";
import { type DbDonation } from "../../../lib/interfaces/Donation";
// Define Types
interface PoolPageProps {
    pool: PublicPool<true>;
    raised?: number;
    supporters?: number;
}
// Define Page
const Pool: NextPage<PoolPageProps> = ({ pool }) => {
    // Define Editor
    const { quill, quillRef } = useQuill({
        placeholder:
            "Explique aqui o porquê de você estar fazendo esta vaquinha.",
        modules: {},
    });
    // Define State
    const router = useRouter();
    const [title, setTitle] = useState(pool.title);
    const [goal, setGoal] = useState(pool.goal);
    // Define Handlers
    useEffect(() => {
        quill?.getModule("toolbar").addHandler("image", imageHandler(quill));
        quill?.setContents(new Delta(pool.description));
        // quill?.on("text-change", (delta) => {
        //     console.log(delta);
        // });
    }, [pool.description, quill]);
    const handleFormStateUpdate = (
        stateUpdater: Dispatch<SetStateAction<string>>,
        trim = true
    ) => {
        return (event: ChangeEvent<HTMLInputElement>) =>
            stateUpdater(trim ? event.target.value.trim() : event.target.value);
    };
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        // Prevent Default
        event.preventDefault();
        // Check Requirements
        if (goal < 1) {
            // Notify User
            alert("Meta não pode ser menor que 1 satoshi");
            // Clear Fields
            setTitle("");
            setGoal(1);
            quill?.setContents(new Delta());
            return;
        }
        // Get Quill Data
        const quillDelta = quill?.getContents() || new Delta();
        // Build Payload
        const payload = {
            title: title.trim(),
            goal,
            description: quillDelta,
        };
        // Send Request
        axios
            .patch(
                new URL(`/api/pool/${pool.id}`, location.toString()).toString(),
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                    },
                }
            )
            .then((res: AxiosResponse<{ data: { id: string } }>) =>
                router.push(`/pool/${res.data.data.id}`)
            )
            .catch((error) => console.error(error));
    };
    // Define Rendering
    return (
        <>
            <Head>
                <title>Editar porquinho: {title}</title>
            </Head>
            <Header />
            <main className="mx-auto max-w-7xl py-8 sm:min-h-[calc(100vh-9.5rem)] min-h-[calc(100vh-9.5rem)]">
                <section className="px-8 py-4 w-full grid grid-cols-1 gap-4 bg-white rounded-lg drop-shadow">
                    <h1 className="block font-fm-primary text-2xl font-bold">
                        Editar um porquinho
                    </h1>
                    <form
                        className="font-fm-primary grid grid-cols-2 gap-4"
                        onSubmit={handleSubmit}
                    >
                        <fieldset
                            name="title"
                            className="space-y-2"
                            style={{ gridColumn: "1" }}
                        >
                            <legend className="font-bold text-lg">
                                Título
                            </legend>
                            <input
                                type="text"
                                className="px-4 h-9 w-full border border-solid border-gray-300 rounded-lg"
                                placeholder="Título do porquinho"
                                required
                                value={title}
                                onChange={handleFormStateUpdate(
                                    setTitle,
                                    false
                                )}
                            />
                        </fieldset>
                        <fieldset
                            name="goal"
                            className="space-y-2"
                            style={{ gridColumn: "2" }}
                        >
                            <legend className="font-bold text-lg">Meta</legend>
                            <CurrencyInput
                                className="px-4 h-9 w-full border border-solid border-gray-300 rounded-lg"
                                placeholder="Sua meta em satoshis"
                                required
                                prefix="ș "
                                decimalsLimit={0}
                                min={1}
                                value={goal}
                                onValueChange={(value, name, values) =>
                                    setGoal(Number(values?.value || "0"))
                                }
                            />
                        </fieldset>
                        <fieldset
                            name="description"
                            className="space-y-2"
                            style={{ gridColumn: "1 / 2 span" }}
                        >
                            <legend className="font-bold text-lg">
                                Descrição
                            </legend>
                            <div>
                                <div ref={quillRef} className=""></div>
                            </div>
                        </fieldset>
                        <button
                            className="ml-auto w-full max-w-xs h-12 text-2xl text-white font-bold rounded-lg bg-[#F9A195]"
                            style={{ gridColumn: "2" }}
                            type="submit"
                        >
                            Salvar
                        </button>
                    </form>
                </section>
            </main>
            <Footer />
        </>
    );
};
// Export Page
export default Pool;
// Export Server Side Functions
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
        "meta.deleted_at": null,
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
