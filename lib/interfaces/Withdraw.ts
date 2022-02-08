import { ObjectId } from "mongodb";
import { WithMeta, WithPublicMeta, Overwrite } from "./helpers";

export interface Withdraw {
    id: string;
    user: number;
    amount: number;
    paidInvoice: string;
}

export type DbWithdraw = Overwrite<
    Omit<PrivateWithdraw<false>, "id">,
    "user",
    ObjectId
>;
export type PrivateWithdraw<Serialize extends boolean = false> = WithMeta<
    Withdraw,
    Serialize
>;
export type PublicWithdraw<Serialize extends boolean = false> = WithPublicMeta<
    Withdraw,
    Serialize
>;
