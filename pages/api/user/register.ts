// Import Dependencies
import isEmail from "validator/lib/isEmail";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { methodHandler } from "../../../lib/api/handler";
import { getDb } from "../../../lib/api/mongodb";
import { scrypt as scryptCallback, randomBytes } from "crypto";
import { promisify } from "util";
import { createToken } from "../../../lib/api/jwt";
import * as cyu from "../../../utils/crypto";
import { BlueWallet } from "../../../lib/api/bluewallet";
import { env } from "process";
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
    const { username: usernameRaw, password: passwordRaw } =
        req.body as PostBody;
    const username = usernameRaw.trim();
    const password = passwordRaw.trim();
    // Check Params
    if (!isEmail(username) || password.length < 6) {
        return res.status(400).json({
            status: "error",
            message: "Invalid form data",
            data: null,
        });
    }
    // Fetch Data
    const db = await getDb();
    // Check Username Taken
    const user = await db.collection("users").findOne({ username });
    if (user) {
        console.log(user);
        return res.status(409).json({
            status: "error",
            message: "User already exists",
            data: null,
        });
    }
    // Bluewallet Registration
    const bwSalt = cyu.getSalt();
    const bwUser = await BlueWallet.createAccount();
    const bwToken = await BlueWallet.authenticate(
        bwUser.login,
        bwUser.password
    );
    // Save on Datbase
    const salt = randomBytes(256);
    const hashedPassword = (await scrypt(password, salt, 256)) as Buffer;
    const now = new Date();
    const userData = {
        username,
        meta: { createdAt: now, updatedAt: now, deletedAt: null },
    };
    const { insertedId: userId } = await db.collection("users").insertOne({
        ...userData,
        password: salt
            .toString("base64")
            .concat(".", hashedPassword.toString("base64")),
        wallet: {
            login: bwUser.login,
            salt: bwSalt.toString("base64"),
            password: cyu
                .encrypt(
                    Buffer.from(bwUser.password),
                    cyu.getKeyFromPassword(
                        Buffer.from(env.BW_ENCRYPTION_KEY),
                        bwSalt
                    )
                )
                .toString("base64"),
        },
    });
    // Respond with Data
    res.status(200).json({
        status: "success",
        message: "User created",
        data: {
            id: userId.toString(),
            token: createToken({
                id: userId.toString(),
                ...userData,
            }),
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
