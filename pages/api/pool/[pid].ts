// Import Dependencies
import { ObjectId } from "mongodb";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { methodHandler } from "../../../lib/api/handler";
import { parseToken } from "../../../lib/api/jwt";
import { getDb } from "../../../lib/api/mongodb";
import { DbPool } from "../../../lib/interfaces/Pool";
import { DbUser } from "../../../lib/interfaces/User";
// Define Types
// Define Routes
const get: NextApiHandler = async (req, res) => {
    // Fetch Params
    const { pid } = req.query;
    // Fetch Data
    const db = await getDb();
    const pool = await db.collection("pools").findOne({
        _id: new ObjectId(pid as string),
        "meta.deleted_at": null,
    });
    // Respond with data
    res.status(200).json(pool);
};
const patch: NextApiHandler = async (req, res) => {
    // Fetch Params
    const { pid } = req.query;
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
    // Fetch Pool and Creator
    const { pool, creator } = await db
        .collection("pools")
        .aggregate<{ pool: DbPool; creator: DbUser }>([
            {
                $match: {
                    _id: new ObjectId(pid as string),
                    "meta.deleted_at": null,
                },
            },
            {
                $replaceRoot: {
                    newRoot: {
                        pool: "$$ROOT",
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "pool.creator",
                    foreignField: "_id",
                    as: "creator",
                },
            },
            {
                $unwind: "$creator",
            },
        ])
        .toArray()
        .then((list) => ({
            pool: list[0]?.pool || null,
            creator: list[0]?.creator || null,
        }));
    // Check User Access
    if (user.username !== creator?.username) {
        // Invalid Permission
        return res.status(403).json({
            status: "error",
            message: "User is not the creator",
            data: null,
        });
    }
    // Do Update
    const now = new Date();
    await db.collection("pools").updateOne(
        {
            _id: new ObjectId(pid as string),
            "meta.deleted_at": null,
        },
        {
            $set: {
                title: title || pool.title,
                description: description || pool.description,
                goal: goal || pool.goal,
                "meta.updated_at": now,
            },
        }
    );
    // Return Update Id
    return res.status(200).json({
        status: "success",
        message: "Pool updated",
        data: {
            id: pid,
        },
    });
};
const remove: NextApiHandler = async (req, res) => {
    // Fetch Params
    const { pid } = req.query;
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
    // Fetch Data
    const db = await getDb();
    // Fetch Pool and Creator
    const { pool, creator } = await db
        .collection("pools")
        .aggregate<{ pool: DbPool; creator: DbUser }>([
            {
                $match: {
                    _id: new ObjectId(pid as string),
                    "meta.deleted_at": null,
                },
            },
            {
                $replaceRoot: {
                    newRoot: {
                        pool: "$$ROOT",
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "pool.creator",
                    foreignField: "_id",
                    as: "creator",
                },
            },
            {
                $unwind: "$creator",
            },
        ])
        .toArray()
        .then((list) => ({
            pool: list[0]?.pool || null,
            creator: list[0]?.creator || null,
        }));
    // Check User Access
    if (user.username !== creator.username) {
        // Invalid Permission
        return res.status(403).json({
            status: "error",
            message: "User is not the creator",
            data: null,
        });
    }
    // Do Soft-Delete (AKA: Update on meta)
    const now = new Date();
    await db.collection("pools").updateOne(
        {
            _id: new ObjectId(pid as string),
            "meta.deleted_at": null,
        },
        {
            $set: {
                "meta.updated_at": now,
                "meta.deleted_at": now,
            },
        }
    );
    // Return Update Id
    return res.status(200).json({
        status: "success",
        message: "Pool deleted",
        data: null,
    });
};
// Define Handler
export default methodHandler({
    GET: get,
    PATCH: patch,
    DELETE: remove,
});
