// Import Dependencies

import { decode, JwtPayload } from "jsonwebtoken";
import { useEffect, useState } from "react";
import { PublicUser } from "../interfaces/User";
import { isBefore } from "date-fns";

// Export Hook
export function useJWTUser() {
    // Define State
    const [jwt, setJWT] = useState<(JwtPayload & PublicUser) | null>(null);
    // Try read JWT from Local Storage
    useEffect(() => {
        const jwtRaw = localStorage.getItem("jwt");
        if (jwtRaw) {
            const decodedJWT = decode(jwtRaw, { json: true }) as JwtPayload &
                PublicUser;
            if (
                !decodedJWT.exp ||
                isBefore(new Date(), new Date(decodedJWT.exp * 1000))
            ) {
                setJWT(decodedJWT);
            }
        }
    }, []);
    // Return Decode JWT
    return jwt;
}
