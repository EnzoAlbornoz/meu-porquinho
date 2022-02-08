/* eslint-disable @next/next/no-img-element */
import { v4 as randomUUID } from "uuid";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { getDb } from "../lib/api/mongodb";
import {
    ChangeEventHandler,
    MouseEventHandler,
    useEffect,
    useMemo,
    useState,
} from "react";
import { ObjectId, WithId } from "mongodb";
import Delta from "quill-delta";
import { DbDonation } from "../lib/interfaces/Donation";
import QrCode from "qrcode.react";
import { setTimeout as setTimeoutCb } from "timers";
import axios, { AxiosResponse } from "axios";
import { promisify } from "util";
import { useJWTUser } from "../lib/hooks/withJWT";
import bolt11 from "bolt11";
import { useRouter } from "next/router";
// Derive Imports
const setTimeout = promisify(setTimeoutCb);
// Define Types
interface WithdrawPageProps {}
// Define Page
const Withdraw: NextPage<WithdrawPageProps> = () => {
    // Define State
    const router = useRouter();
    const jwt = useJWTUser();
    const [paymentRequest, setPaymentRequest] = useState("");
    const [balance, setBalance] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    // Define Effects
    useEffect(() => {
        if (!jwt) return;
        axios
            .get("/api/user/balance", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                },
            })
            .then(
                (
                    res: AxiosResponse<{
                        status: "success";
                        message: string;
                        data: {
                            amount: number;
                        };
                    }>
                ) => {
                    setBalance(res.data.data.amount);
                }
            )
            .catch((error) => console.error(error));
    }, [jwt]);
    // Define Handlers
    const handlePaymentRequest: ChangeEventHandler<HTMLInputElement> = (
        event
    ) => {
        // Prevent Default
        event.preventDefault();
        // Update Payment Request
        setPaymentRequest(event.target.value);
        setErrorMessage(null);
    };
    const handlePayment: MouseEventHandler<HTMLButtonElement> = async (
        event
    ) => {
        // Prevent Default
        event.preventDefault();
        // Make Payment
        try {
            await axios.post(
                "/api/user/withdraw",
                { invoice: paymentRequest },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                    },
                }
            );
            // Reload Page
            router.reload();
        } catch (error) {
            setErrorMessage("Não foi possivel realizar o pagamento");
        }
    };
    // Define Computed Values
    const decodedInvoice = useMemo(() => {
        if (!paymentRequest) return null;
        try {
            const decodedInvoice = bolt11.decode(paymentRequest);
            return decodedInvoice;
        } catch {
            return null;
        }
    }, [paymentRequest]);
    const canPay = useMemo(() => {
        if (
            typeof decodedInvoice?.satoshis === "number" &&
            typeof balance === "number"
        ) {
            return decodedInvoice.satoshis <= balance;
        }
    }, [decodedInvoice, balance]);
    // Define Subrenders
    const paymentInfo = useMemo(() => {
        if (!decodedInvoice) {
            return <div></div>;
        }
        return (
            <div className="grid gap-4 grid-rows-3 grid-flow-row md:grid-rows-1 md:grid-flow-col">
                <div className="">
                    <legend className="font-bold">Destinatário: </legend>
                    <span className="text-sm">
                        {decodedInvoice.payeeNodeKey}
                    </span>
                </div>
                <div className="">
                    <legend className="font-bold">Quantidade: </legend>
                    <span className="text-sm">{decodedInvoice.satoshis}</span>
                </div>
                <div className="">
                    <legend className="font-bold">Expira em: </legend>
                    <span className="text-sm">
                        {new Date(
                            decodedInvoice.timeExpireDateString || Date.now()
                        ).toLocaleString("pt-BR", {
                            timeZone: "America/Sao_Paulo",
                        })}
                    </span>
                </div>
            </div>
        );
    }, [decodedInvoice]);
    const balanceDisplay = useMemo(() => {
        if (balance !== null) {
            return (
                <div className="mt-2 flex space-x-1 justify-center">
                    <legend className="font-semibold">Saldo:</legend>
                    <span className="font-bold">{balance}</span>
                </div>
            );
        }
        return <></>;
    }, [balance]);
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
    // Define Render
    return (
        <>
            <Head>
                <title>Sacar</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header></Header>
            <main className="mx-auto max-w-7xl pb-8 sm:min-h-[calc(100vh-9.5rem)] font-fm-primary">
                <div className="px-8 my-8 py-6 bg-white rounded-lg drop-shadow space-y-6 flex flex-col">
                    <div>
                        <h1 className="text-center text-4xl font-bold">
                            Sacar
                        </h1>
                        {balanceDisplay}
                    </div>
                    <hr />
                    <fieldset className="text-center space-y-4">
                        <legend className="text-xl ">
                            Requisição de Pagamento
                        </legend>
                        <input
                            type={"text"}
                            className="px-4 py-2 w-full border-gray-300 border-solid border-2 rounded-lg"
                            onChange={handlePaymentRequest}
                            value={paymentRequest}
                        />
                    </fieldset>
                    {paymentInfo}
                    <button
                        disabled={!canPay}
                        type="button"
                        className="py-3 text-xl font-bold text-white bg-[#F9A195] rounded-lg md:max-w-2xl md:w-full md:mx-auto hover:drop-shadow disabled:bg-gray-400 disabled:cursor-not-allowed"
                        onClick={handlePayment}
                    >
                        Transferir
                    </button>
                    {errorDisplay}
                    <hr />
                </div>
            </main>

            <Footer />
        </>
    );
};

export default Withdraw;
// Export Server Side Functions
// export const getServerSideProps: GetServerSideProps<WithdrawPageProps> = async (
//     context
// ) => {
//     // Fetch Data
//     // Return data
//     return {
//         props: {},
//     };
// };
