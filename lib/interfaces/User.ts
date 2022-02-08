import { WithMeta, WithPublicMeta } from "./helpers";

export interface User {
    id: string;
    username: string;
    password: string;
    wallet: {
        login: string;
        salt: string;
        password: string;
    };
}

export type DbUser = Omit<PrivateUser<false>, "id">;
export type PrivateUser<Serialize extends boolean = false> = WithMeta<
    User,
    Serialize
>;
export type PublicUser<Serialize extends boolean = false> = WithPublicMeta<
    Omit<User, "password" | "wallet">,
    Serialize
>;
