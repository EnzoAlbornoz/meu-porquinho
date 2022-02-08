import { ObjectId } from "mongodb";
import Op from "quill-delta/dist/Op";
import { Overwrite, WithMeta, WithPublicMeta } from "./helpers";

export interface Pool {
    id: string;
    title: string;
    description:
        | Array<Op>
        | {
              ops: Array<Op>;
          };
    goal: number;
    creator: string;
}

export type DbPool = Overwrite<
    Omit<PrivatePool<false>, "id">,
    "creator",
    ObjectId
>;
export type PrivatePool<Serialize extends boolean = false> = WithMeta<
    Pool,
    Serialize
>;
export type PublicPool<Serialize extends boolean = false> = WithPublicMeta<
    Pool,
    Serialize
>;
