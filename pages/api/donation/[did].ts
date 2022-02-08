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
    const { did } = req.query;
    const donationId = Array.isArray(did) ? did[0] : did;
    // Fetch Data
    const db = await getDb();
    const donationDoc = await db.collection<DbDonation>("donations").findOne({
        _id: new ObjectId(donationId),
    });
    // Check Donation Exists
    if (!donationDoc) {
        return res.status(404).json({
            status: "error",
            message: "Donation not found",
            data: null,
        });
    }
    const poolDoc = await db.collection<DbPool>("pools").findOne({
        _id: new ObjectId(donationDoc.pool),
    });
    // Check Pool Exists
    if (!poolDoc) {
        return res.status(500).json({
            status: "error",
            message: "Unknown error occured",
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
    // Check Payment Status
    const decodedInvoice = await BlueWallet.decodeInvoice(
        accessToken,
        donationDoc.invoice
    );
    const paid = await BlueWallet.checkPayment(
        accessToken,
        decodedInvoice.paymentHash
    );
    // Check Paid
    if (!paid) {
        return res.status(200).json({
            status: "success",
            message: "Verified invoice status",
            data: {
                paid: paid,
            },
        });
    } else {
    }
    // Update on Datbase
    const now = new Date();
    await db.collection("donations").updateOne(
        {
            _id: new ObjectId(donationId),
        },
        {
            $set: { paid: true, "meta.updatedAt": now },
        }
    );
    // Respond with Data
    return res.status(200).json({
        status: "success",
        message: "Verified invoice status",
        data: {
            paid: paid,
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
