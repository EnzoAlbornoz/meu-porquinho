// Import Depndencies

import { isBefore } from "date-fns";
import { ObjectId } from "mongodb";
import { env } from "process";
import { BlueWallet } from "../lib/api/bluewallet";
import { getDb } from "../lib/api/mongodb";
import { DbUser } from "../lib/interfaces/User";
import * as cyu from "./crypto";

// Export Helper
export async function getUserAcessToken(userId: string) {
    // Try Cached
    const cached = BlueWallet.adminGetAccessToken(userId);
    if (cached) {
        if (isBefore(new Date(), cached.expires)) {
            return cached.accessToken;
        }
        // Simply Reauth
        const { accessToken } = await BlueWallet.reauthenticate(
            cached.login,
            cached.refreshToken
        );
        return accessToken;
    }
    // Fetch User
    const db = await getDb();
    const userDoc = await db
        .collection<DbUser>("users")
        .findOne({ _id: new ObjectId(userId) });
    if (!userDoc) return null;
    // Decrypt Wallet Password
    const bwLogin = userDoc.wallet.login;
    const bwPassword = cyu
        .decrypt(
            Buffer.from(userDoc.wallet.password, "base64"),
            cyu.getKeyFromPassword(
                Buffer.from(env.BW_ENCRYPTION_KEY),
                Buffer.from(userDoc.wallet.salt, "base64")
            )
        )
        .toString("utf8");
    // Authenticate
    const tokens = await BlueWallet.authenticate(bwLogin, bwPassword);
    return tokens.accessToken;
}
