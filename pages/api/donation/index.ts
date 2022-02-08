// Import Dependencies
import { ObjectId } from "mongodb";
import { NextApiHandler } from "next";
import { BlueWallet } from "../../../lib/api/bluewallet";
import { methodHandler } from "../../../lib/api/handler";
import { parseToken } from "../../../lib/api/jwt";
import { getDb } from "../../../lib/api/mongodb";
import { DbPool } from "../../../lib/interfaces/Pool";
import { getUserAcessToken } from "../../../utils/adminWalletToken";
// Define Types
// Define Routes
const post: NextApiHandler = async (req, res) => {
    // Fetch Params
    const { poolId: pid, amount } = req.body as {
        poolId: string;
        amount: number;
    };
    // Check Params
    if (amount <= 0) {
        return res.status(400).json({
            status: "error",
            message: "Invalid amount",
            data: null,
        });
    }
    // Fetch Data
    const db = await getDb();
    const now = new Date();
    const poolDoc = await db.collection<DbPool>("pools").findOne({
        _id: new ObjectId(pid),
    });
    // Check Pool Exists
    if (!poolDoc) {
        return res.status(404).json({
            status: "error",
            message: "Pool not found",
            data: null,
        });
    }
    // Fetch Access Token
    const accessToken = await getUserAcessToken(poolDoc.creator.toString());
    if (!accessToken) {
        return res.status(500).json({
            status: "error",
            messsage: "Unknown error occured",
            data: null,
        });
    }
    // Create Invoice
    const { paymentRequest: invoice } = await BlueWallet.createInvoice(
        accessToken,
        amount,
        `Donation for ${poolDoc.title} |__${pid}__|`
    );
    // Save on Datbase
    const { insertedId: donationId } = await db
        .collection("donations")
        .insertOne({
            pool: new ObjectId(pid),
            paid: false,
            amount,
            invoice,
            meta: { createdAt: now, updatedAt: now, deletedAt: null },
        });
    // Respond with Data
    return res.status(200).json({
        status: "success",
        message: "Donation created",
        data: {
            id: donationId,
            invoice: invoice,
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
