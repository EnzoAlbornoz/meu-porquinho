// Import Dependencies
import { ObjectId } from "mongodb";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { methodHandler } from "../../../lib/api/handler";
import { getDb } from "../../../lib/api/mongodb";
// Define Types
// Define Routes
const post: NextApiHandler = async (req, res) => {
    // Fetch Params
    const { title, description, goal } = req.body;
    // Fetch Data
    const db = await getDb();
    const now = new Date();
    // Save on Datbase
    const pool = await db.collection("pools").insertOne({
        title,
        description,
        goal,
        meta: { createdAt: now, updatedAt: now, deletedAt: null },
    });
    // Respond with Data
    res.status(200).send(pool);
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
