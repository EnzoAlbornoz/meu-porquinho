// Import Dependencies
import { ObjectId } from "mongodb";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { methodHandler } from "../../../lib/api/handler";
import { getDb } from "../../../lib/api/mongodb";
// Define Types
// Define Routes
const get: NextApiHandler = async (req, res) => {
    // Fetch Params
    const { pid } = req.query;
    // Fetch Data
    const db = await getDb();
    const pool = db.collection("pools").findOne({
        id: new ObjectId(pid as string),
    });
    // Respond with data
    res.status(200).json(pool);
};
// Define Handler
export default methodHandler({
    GET: get,
});
