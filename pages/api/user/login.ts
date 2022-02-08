// Import Dependencies
import { ObjectId } from "mongodb";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { methodHandler } from "../../../lib/api/handler";
import { getDb } from "../../../lib/api/mongodb";
import { scrypt as scryptCallback, randomBytes } from "crypto";
import { promisify } from "util";
import { createToken } from "../../../lib/api/jwt";
import { DbUser, PrivateUser, PublicUser } from "../../../lib/interfaces/User";
import * as cyu from "../../../utils/crypto";
import { env } from "process";
import { BlueWallet } from "../../../lib/api/bluewallet";
// Preprocess From Import
const scrypt = promisify(scryptCallback);
// Define Types
interface PostBody {
    username: string;
    password: string;
}
// Define Routes
const post: NextApiHandler = async (req, res) => {
    // Fetch Params
    const { username, password } = req.body as PostBody;
    // Fetch Data
    const db = await getDb();
    // Fetch User
    const dbUser = await db.collection<DbUser>("users").findOne({ username });
    if (!dbUser) {
        return res.status(404).json({
            status: "error",
            message: "User not found",
            data: null,
        });
    }
    // Verify Password
    const [salt, hash] = dbUser.password.split(".");
    const hashedAttempt = (await scrypt(
        password,
        Buffer.from(salt, "base64"),
        256
    )) as Buffer;
    if (hashedAttempt.toString("base64") !== hash) {
        // Invalid Password
        return res.status(401).json({
            status: "error",
            message: "Invalid password",
            data: null,
        });
    }
    // Load BlueWallet Data
    const bwPassword = cyu
        .decrypt(
            Buffer.from(dbUser.wallet.password, "base64"),
            cyu.getKeyFromPassword(
                Buffer.from(env.BW_ENCRYPTION_KEY),
                Buffer.from(dbUser.wallet.salt, "base64")
            )
        )
        .toString("utf8");
    const bwToken = await BlueWallet.authenticate(
        dbUser.wallet.login,
        bwPassword
    );
    // Prepare JWT data
    const userData: PublicUser = {
        id: dbUser._id.toString(),
        username: dbUser.username,
        meta: {
            createdAt: dbUser.meta.createdAt,
            updatedAt: dbUser.meta.updatedAt,
        },
    };
    // Respond with Data
    res.status(200).json({
        status: "success",
        message: "User created",
        data: {
            id: userData.id,
            token: createToken(userData),
        },
    });
};
// Define Handler
export default methodHandler({
    POST: post,
});
// Define Custom Params
// export const config = {
//     api: {
//         bodyParser: {
//             sizeLimit: "16mb",
//         },
//     },
// };
