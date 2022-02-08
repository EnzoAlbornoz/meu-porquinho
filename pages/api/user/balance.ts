// Import Dependencies
import { ObjectId } from "mongodb";
import { NextApiHandler } from "next";
import { BlueWallet } from "../../../lib/api/bluewallet";
import { methodHandler } from "../../../lib/api/handler";
import { parseToken } from "../../../lib/api/jwt";
import { getDb } from "../../../lib/api/mongodb";
import { DbDonation } from "../../../lib/interfaces/Donation";
import { DbPool } from "../../../lib/interfaces/Pool";
import { getUserAcessToken } from "../../../utils/adminWalletToken";
// Define Types
// Define Routes
const get: NextApiHandler = async (req, res) => {
    // Fetch Params
    const { authorization } = req.headers;
    // Check User
    const user = parseToken(authorization?.split(" ").at(-1));
    if (!user) {
        return res.status(401).json({
            status: "error",
            message: "User not authenticated",
            data: null,
        });
    }
    // Fetch Token
    const bwToken = await getUserAcessToken(user.id);
    if (!bwToken) {
        return res.status(500).json({
            status: "error",
            message: "Unknown error ocurred",
            data: null,
        });
    }
    // Get Balance
    const balance = await BlueWallet.balance(bwToken);
    // Return Data
    return res.status(200).json({
        status: "success",
        message: "Checked balance",
        data: {
            amount: balance,
        },
    });
};
// Define Handler
export default methodHandler({
    GET: get,
});
// Define Custom Params
// export const config = {
//     api: {
//         bodyParser: {
//             sizeLimit: "16mb",
//         },
//     },
// };
