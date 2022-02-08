// Import Dependencies
import { ObjectId } from "mongodb";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { methodHandler } from "../../../lib/api/handler";
import { parseToken } from "../../../lib/api/jwt";
import { getDb } from "../../../lib/api/mongodb";
import { DbWithdraw } from "../../../lib/interfaces/Withdraw";
import bolt11, { type PaymentRequestObject } from "bolt11";
import { getUserAcessToken } from "../../../utils/adminWalletToken";
import { BlueWallet } from "../../../lib/api/bluewallet";
// Define Types
// Define Routes
const post: NextApiHandler = async (req, res) => {
    // Fetch Params
    const { authorization } = req.headers;
    const { invoice: invoiceRaw } = req.body;
    // Check Invoice
    let invoice: PaymentRequestObject;
    try {
        invoice = bolt11.decode(invoiceRaw);
    } catch {
        return res.status(400).json({
            status: "error",
            message: "Invalid Invoice",
            data: null,
        });
    }
    // Check User
    const user = parseToken(authorization?.split(" ").at(-1));
    if (!user) {
        return res.status(401).json({
            status: "error",
            message: "User not authenticated",
            data: null,
        });
    }

    // Fetch Access Token
    const bwToken = await getUserAcessToken(user.id);
    if (!bwToken) {
        return res.status(500).json({
            status: "error",
            message: "Uknown error occured",
            data: null,
        });
    }
    // Pay Invoice
    await BlueWallet.payInvoice(bwToken, invoiceRaw);
    // Fetch Data
    const db = await getDb();
    const now = new Date();
    // Save on Datbase
    const { insertedId: withdrawId } = await db
        .collection<DbWithdraw>("withdrawals")
        .insertOne({
            user: new ObjectId(user.id),
            amount: Number(invoice.satoshis),
            paidInvoice: invoiceRaw,
            meta: { createdAt: now, updatedAt: now, deletedAt: null },
        });
    // Respond with Data
    return res.status(200).json({
        status: "success",
        message: "Pool created",
        data: {
            id: withdrawId,
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
