import { ObjectId } from "mongodb";
import { WithMeta, WithPublicMeta, Overwrite } from "./helpers";

export interface Donation {
    id: string;
    pool: string;
    paid: boolean;
    amount: number;
    invoice: string;
}

export type DbDonation = Overwrite<
    Omit<PrivateDonation<false>, "id">,
    "pool",
    ObjectId
>;
export type PrivateDonation<Serialize extends boolean = false> = WithMeta<
    Donation,
    Serialize
>;
export type PublicDonation<Serialize extends boolean = false> = WithPublicMeta<
    Donation,
    Serialize
>;
