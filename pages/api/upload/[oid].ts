// Import Dependencies
import { type Fields, type Files, IncomingForm } from "formidable";
import { GridFSBucket, ObjectId } from "mongodb";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { methodHandler } from "../../../lib/api/handler";
import { getDb } from "../../../lib/api/mongodb";
import { promisify } from "util";
import {
    pipeline as pipelineCallback,
    type Readable,
    type Writable,
} from "stream";
// Define Helpers
const pipeline = promisify(pipelineCallback);
const parseForm = (
    req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> => {
    const form = new IncomingForm();
    return new Promise((res, rej) => {
        form.parse(req, (err, fields, files) =>
            err ? rej(err) : res({ fields, files })
        );
    });
};
// Define Routes
const get: NextApiHandler = async (req, res) => {
    // Get Params
    const { oid } = req.query;
    // Connect to Bucket
    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });
    const fileId = new ObjectId(oid as string);
    // Try find the resource
    const fileMeta = await bucket
        .find({ _id: fileId })
        .toArray()
        .then((files) => files.shift());
    if (!fileMeta) {
        // Does not have file
        return res.status(200).send("404 Not Found");
    }
    // Has file - Download it
    const fileStream = bucket.openDownloadStream(fileId);
    // Define Response
    res.status(200)
        .setHeader(
            "Content-Type",
            fileMeta.metadata?.mimeType || fileMeta.contentType
        )
        .setHeader("Content-Length", fileMeta.length);
    // Start Streaming Data
    return pipeline(fileStream as Readable, res as Writable);
};
// Define Handler
export default methodHandler({
    GET: get,
});
// Define Helpers
