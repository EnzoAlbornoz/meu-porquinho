// Import Dependencies
import { type Fields, type Files, IncomingForm } from "formidable";
import { GridFSBucket, ObjectId } from "mongodb";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { methodHandler } from "../../../lib/api/handler";
import { getDb } from "../../../lib/api/mongodb";
import { v4 as uuid } from "uuid";
import { createReadStream } from "fs";
import { pipeline } from "stream/promises";
// Define Helpers
const parseForm = (
    req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> => {
    const form = new IncomingForm({
        uploadDir: "/tmp",
    });
    return new Promise((res, rej) => {
        form.parse(req, (err, fields, files) =>
            err ? rej(err) : res({ fields, files })
        );
    });
};
// Define Routes
const post: NextApiHandler = async (req, res) => {
    // Parse Form
    console.info("Parsing upload");
    const form = await parseForm(req);
    // Connect to Bucket
    console.info("Connecting to Bucket");
    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });
    // Save on Datbase
    console.info(`Uploading ${Object.values(form.files).length} files`);
    const uploadedFilesIds = await Promise.all(
        Object.values(form.files)
            .flat()
            .map(async (file) => {
                // Start Upload
                console.info(`Uploading ${file.newFilename}`);
                const uploadStream = bucket.openUploadStream(`${uuid()}.bin`, {
                    contentType: file.mimetype || undefined,
                    metadata: {
                        mimeType: file.mimetype,
                        filename: file.originalFilename,
                        uploadedAt: new Date(),
                    },
                });
                await pipeline(createReadStream(file.filepath), uploadStream);
                return uploadStream.id;
            })
    );
    console.info("Uploaded successfully");
    // Respond with Data
    res.status(200).json(uploadedFilesIds);
};
// Define Handler
export default methodHandler({
    POST: post,
});
// Define Custom Params
export const config = {
    api: {
        bodyParser: false,
    },
};
