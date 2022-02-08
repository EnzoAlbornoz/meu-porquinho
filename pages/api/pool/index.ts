// Import Dependencies
import { ObjectId } from "mongodb";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { methodHandler } from "../../../lib/api/handler";
import { parseToken } from "../../../lib/api/jwt";
import { getDb } from "../../../lib/api/mongodb";
// Define Types
// Define Routes
const post: NextApiHandler = async (req, res) => {
    // Fetch Params
    const { authorization } = req.headers;
    const { title, description, goal } = req.body;
    // Check User
    const user = parseToken(authorization?.split(" ").at(-1));
    if (!user) {
        return res.status(401).json({
            status: "error",
            message: "User not authenticated",
            data: null,
        });
    }
    // Fetch Data
    const db = await getDb();
    const now = new Date();
    // Save on Datbase
    const { insertedId: poolId } = await db.collection("pools").insertOne({
        title,
        description,
        goal,
        creator: new ObjectId(user.id),
        meta: { createdAt: now, updatedAt: now, deletedAt: null },
    });
    // Respond with Data
    return res.status(200).json({
        status: "success",
        message: "Pool created",
        data: {
            id: poolId,
        },
    });
};
// Define Handler
export default methodHandler({
    POST: post,
});
// Define Custom Params
export const config = {
    api: {
        bodyParser: {
            sizeLimit: "16mb",
        },
    },
};
