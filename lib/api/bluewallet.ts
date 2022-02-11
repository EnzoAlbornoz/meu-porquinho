// Import Dependencies
import axios, { type AxiosInstance } from "axios";
import NodeCache from "node-cache";
import { addHours } from "date-fns";
// Define Types
interface CreateAcountResData {
    login: string;
    password: string;
}
interface AuthenticateResData {
    access_token: string;
    refresh_token: string;
}
interface AuthenticateReturn {
    accessToken: string;
    refreshToken: string;
}
interface CreateInvoiceResData {
    payment_request: string;
    r_hash: {
        type: "Buffer";
        data: Array<number>;
    };
    add_index: number;
    pay_req: string;
}
interface CreateInvoiceReturn {
    paymentRequest: string;
    requestHash: Buffer;
    addIndex: number;
}
interface BalanceResData {
    BTC: {
        AvailableBalance: number;
    };
}
interface CheckPaymentResData {
    paid: boolean;
}
interface DecodeInvoiceResData {
    route_hints: unknown[];
    features: Record<
        string,
        { name: string; is_required: boolean; is_known: boolean }
    >;
    destination: string;
    payment_hash: string;
    num_satoshis: string;
    num_msat: string;
    timestamp: string;
    expiry: string;
    description: string;
    description_hash: string;
    fallback_addr: string;
    cltv_expiry: string;
    payment_addr: {
        type: "Buffer";
        data: Array<number>;
    };
}
interface DecodeInvoiceReturn {
    amount: number;
    paymentHash: string;
    description: string;
    timestamp: Date;
    expiry: number;
}
// Export Wallet API
export class BlueWallet {
    static endpoint: AxiosInstance = axios.create({
        baseURL: "https://lndhub.io/",
    });
    static authCache = new NodeCache({ stdTTL: 3600 * 24 });

    /**
     * Create a new custody account on the LightningHub.
     * Each account has it's own spendable balance which
     * is managed via an internal ledger (database).
     */
    static async createAccount(): Promise<CreateAcountResData> {
        try {
            const res = await this.endpoint.post<CreateAcountResData>("create");
            return res.data;
        } catch (error) {
            // @ts-ignore Cause already exists but its not typed
            throw new Error("Cannot create account", { cause: error });
        }
    }

    static async authenticate(
        login: string,
        password: string
    ): Promise<AuthenticateReturn> {
        try {
            const res = await this.endpoint.post<AuthenticateResData>("auth", {
                login,
                password,
            });
            const { access_token: accessToken, refresh_token: refreshToken } =
                res.data;

            // Add To Cache
            this.authCache.set(
                login,
                JSON.stringify({
                    login,
                    accessToken,
                    refreshToken,
                    expires: addHours(new Date(), 1).toISOString(),
                })
            );
            // Return to User
            return { accessToken, refreshToken };
        } catch (error) {
            console.error(error);
            // @ts-ignore Cause already exists but its not typed
            throw new Error("Cannot authenticate", { cause: error });
        }
    }

    static async reauthenticate(
        login: string,
        refreshToken: string
    ): Promise<AuthenticateReturn> {
        try {
            const res = await this.endpoint.post<AuthenticateResData>("auth", {
                refresh_token: refreshToken,
            });
            const { access_token: accessToken, refresh_token: refreshedToken } =
                res.data;

            // Add To Cache
            this.authCache.set(
                login,
                JSON.stringify({
                    login,
                    accessToken,
                    refreshToken: refreshedToken,
                    expires: addHours(new Date(), 1).toISOString(),
                })
            );
            // Return to User
            return { accessToken, refreshToken };
        } catch (error) {
            // @ts-ignore Cause already exists but its not typed
            throw new Error("Cannot authenticate", { cause: error });
        }
    }

    static async createInvoice(
        accessToken: string,
        amount: number,
        description: string
    ): Promise<CreateInvoiceReturn> {
        try {
            if (amount < 0)
                throw new RangeError("Amount need to be a positive value");
            const res = await this.endpoint.post<CreateInvoiceResData>(
                "addinvoice",
                {
                    amt: amount,
                    memo: description,
                },
                {
                    headers: {
                        Authorization: accessToken,
                    },
                }
            );
            const payload: CreateInvoiceReturn = {
                paymentRequest: res.data.payment_request,
                requestHash: Buffer.from(res.data.r_hash.data),
                addIndex: res.data.add_index,
            };
            return payload;
        } catch (error) {
            console.error(error);
            // @ts-ignore Cause already exists but its not typed
            throw new Error("Cannot create invoice", { cause: error });
        }
    }

    static async payInvoice(
        accessToken: string,
        invoice: string,
        amount?: number
    ): Promise<void> {
        try {
            if (typeof amount === "number" && amount <= 0)
                throw new RangeError(
                    "Amount need to be a non zero positive value"
                );
            const res = await this.endpoint.post<CreateInvoiceResData>(
                "payinvoice",
                {
                    invoice: invoice,
                    amount: amount,
                },
                {
                    headers: {
                        Authorization: accessToken,
                    },
                }
            );
            if ((res.data as any).error) {
                // Error Ocurred
                throw new Error((res.data as any).message);
            }
        } catch (error) {
            console.log(error);
            // @ts-ignore Cause already exists but its not typed
            throw new Error("Cannot pay invoice", { cause: error });
        }
    }

    static async balance(accessToken: string): Promise<number> {
        try {
            const res = await this.endpoint.get<BalanceResData>("balance", {
                headers: {
                    Authorization: accessToken,
                },
            });
            return res.data.BTC.AvailableBalance;
        } catch (error) {
            // @ts-ignore Cause already exists but its not typed
            throw new Error("Cannot verify balance", { cause: error });
        }
    }

    static async decodeInvoice(
        accessToken: string,
        invoice: string
    ): Promise<DecodeInvoiceReturn> {
        try {
            const res = await this.endpoint.get<DecodeInvoiceResData>(
                `decodeinvoice`,
                {
                    headers: {
                        Authorization: accessToken,
                    },
                    params: {
                        invoice,
                    },
                }
            );
            return {
                paymentHash: res.data.payment_hash,
                amount: Number(res.data.num_satoshis),
                description: res.data.description,
                timestamp: new Date(Number(res.data.timestamp) * 1000),
                expiry: Number(res.data.expiry),
            };
        } catch (error) {
            // @ts-ignore Cause already exists but its not typed
            throw new Error("Cannot decode invoice", { cause: error });
        }
    }

    static async checkPayment(
        accessToken: string,
        paymentHash: string
    ): Promise<boolean> {
        try {
            const res = await this.endpoint.get<CheckPaymentResData>(
                `checkpayment/${paymentHash}`,
                {
                    headers: {
                        Authorization: accessToken,
                    },
                }
            );
            return res.data.paid;
        } catch (error) {
            // @ts-ignore Cause already exists but its not typed
            throw new Error("Cannot check payment", { cause: error });
        }
    }

    static adminGetAccessToken(userId: string) {
        const data = this.authCache.get<string>(userId);
        if (!data) return null;
        const parsedData = JSON.parse(data);
        return { ...parsedData, expires: new Date(parsedData.expires) } as {
            login: string;
            accessToken: string;
            refreshToken: string;
            expires: Date;
        };
    }
}
