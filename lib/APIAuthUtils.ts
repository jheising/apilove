import jwt from "jsonwebtoken";
import isNil from "lodash/isNil";
import {APIConfig} from "./APIConfig";

export class APIAuthUser<T = any> {
    userID: string;
    userName: string;

    extraData?:T;
}

export class APIAuthCredentials extends APIAuthUser {
    isAuthenticated: boolean;
    isExpired: boolean;

    expires?: Date;
    refreshToken?: string;

    rawJWTPayload?: object;
}

export class APIAuthUtils {

    static setJWTSessionCookie(res, jwtToken: string, domain: string) {
        let expiration = new Date(Number(new Date()) + 1.577e+11);
        res.cookie("session", jwtToken, {domain: domain, expires: expiration, httpOnly: true});
    }

    static deleteJWTSessionCookie(res, domain: string) {
        let expiration = new Date();
        res.cookie("session", "", {domain: domain, expires: expiration, httpOnly: true});
    }

    private static getAuthCredentialsFromJWT(token: string, ignoreExpiration: boolean = true): APIAuthCredentials {
        let authCreds: APIAuthCredentials = {
            isAuthenticated: false,
            isExpired: true,
            userID: null,
            userName: null
        };

        if (!token) {
            return authCreds;
        }

        try {
            const decodedAuthToken = jwt.verify(token, APIConfig.JWT_SECRET, {ignoreExpiration});
            authCreds.isAuthenticated = true;
            authCreds.userName = decodedAuthToken.u;
            authCreds.userID = decodedAuthToken.i;
            authCreds.refreshToken = decodedAuthToken.r;
            authCreds.extraData = decodedAuthToken.ext;
            authCreds.rawJWTPayload = decodedAuthToken;

            if(decodedAuthToken.exp)
            {
                authCreds.expires = new Date(decodedAuthToken.exp * 1000);
                authCreds.isExpired = authCreds.expires <= (new Date());
            }

        } catch (err) {
        }

        return authCreds;
    }

    static getJWTFromRequest(req): string {

        let token;

        // try getting the auth info from the cookie first
        if (req.cookies) {
            token = req.cookies.session;
        }

        if (isNil(token)) {
            // Try getting from the Authorization header next
            token = req.get("Authorization");

            if (!isNil(token)) {
                token = token.replace(/^Bearer\s/, "");
            }
        }

        return token;
    }

    static getAuthCredentialsFromRequest(req, allowExpired: boolean = false): APIAuthCredentials {
        return APIAuthUtils.getAuthCredentialsFromJWT(APIAuthUtils.getJWTFromRequest(req));
    }

    static createJWT(userID: string, username: string, expiresIn: string | number = "1h", refreshToken?: string, extraData?: object): string {

        let options = undefined;

        if (expiresIn) {
            options = {
                expiresIn: expiresIn
            }
        }

        let payload:any = {
            i: userID,
            u: username
        };

        if(refreshToken)
        {
            payload.r = refreshToken;
        }

        if(extraData)
        {
            payload.ext = extraData;
        }

        return jwt.sign(payload, APIConfig.JWT_SECRET, options);
    }

    static getAPIAuthUserFromAuthCredentials<T = any>(authCredentials:APIAuthCredentials):APIAuthUser<T>
    {
        return {
            userID: authCredentials.userID,
            userName: authCredentials.userName,
            extraData: authCredentials.extraData
        };
    }
}