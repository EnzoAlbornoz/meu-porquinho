// Import Dependencies
import {
    type NextApiRequest,
    type NextApiResponse,
    type NextApiHandler,
} from "next";
// Define Types
export type HTTPMethod =
    | "CONNECT"
    | "DELETE"
    | "GET"
    | "HEAD"
    | "OPTIONS"
    | "PATCH"
    | "POST"
    | "PUT"
    | "TRACE";
// Export Handler
export function methodHandler<
    Req extends NextApiRequest,
    Res extends NextApiResponse
>(handlers: Partial<Record<HTTPMethod, NextApiHandler>>) {
    return (req: Req, res: Res) => {
        if (!Object.keys(handlers).includes(req.method || "")) {
            return res.status(501).send("501 Not Implemented");
        }
        // Call Handler
        return (handlers[req.method as HTTPMethod] as NextApiHandler)(req, res);
    };
}
