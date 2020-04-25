"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isNil_1 = __importDefault(require("lodash/isNil"));
const APIConfig_1 = require("./APIConfig");
class APIAuthUser {
}
exports.APIAuthUser = APIAuthUser;
class APIAuthCredentials extends APIAuthUser {
}
exports.APIAuthCredentials = APIAuthCredentials;
class APIAuthUtils {
    static setJWTSessionCookie(res, jwtToken, domain) {
        let expiration = new Date(Number(new Date()) + 1.577e+11);
        res.cookie("session", jwtToken, { domain: domain, expires: expiration, httpOnly: true });
    }
    static deleteJWTSessionCookie(res, domain) {
        let expiration = new Date();
        res.cookie("session", "", { domain: domain, expires: expiration, httpOnly: true });
    }
    static getAuthCredentialsFromJWT(token, ignoreExpiration = true) {
        let authCreds = {
            isAuthenticated: false,
            isExpired: true,
            userID: null,
            userName: null
        };
        if (!token) {
            return authCreds;
        }
        try {
            const decodedAuthToken = jsonwebtoken_1.default.verify(token, APIConfig_1.APIConfig.JWT_SECRET, { ignoreExpiration });
            authCreds.isAuthenticated = true;
            authCreds.userName = decodedAuthToken.u;
            authCreds.userID = decodedAuthToken.i;
            authCreds.refreshToken = decodedAuthToken.r;
            authCreds.extraData = decodedAuthToken.ext;
            authCreds.rawJWTPayload = decodedAuthToken;
            if (decodedAuthToken.exp) {
                authCreds.expires = new Date(decodedAuthToken.exp * 1000);
                authCreds.isExpired = authCreds.expires <= (new Date());
            }
        }
        catch (err) {
        }
        return authCreds;
    }
    static getJWTFromRequest(req) {
        let token;
        // try getting the auth info from the cookie first
        if (req.cookies) {
            token = req.cookies.session;
        }
        if (isNil_1.default(token)) {
            // Try getting from the Authorization header next
            token = req.get("Authorization");
            if (!isNil_1.default(token)) {
                token = token.replace(/^Bearer\s/, "");
            }
        }
        return token;
    }
    static getAuthCredentialsFromRequest(req, allowExpired = false) {
        return APIAuthUtils.getAuthCredentialsFromJWT(APIAuthUtils.getJWTFromRequest(req));
    }
    static createJWT(userID, username, expiresIn = "1h", refreshToken, extraData) {
        let options = undefined;
        if (expiresIn) {
            options = {
                expiresIn: expiresIn
            };
        }
        let payload = {
            i: userID,
            u: username
        };
        if (refreshToken) {
            payload.r = refreshToken;
        }
        if (extraData) {
            payload.ext = extraData;
        }
        return jsonwebtoken_1.default.sign(payload, APIConfig_1.APIConfig.JWT_SECRET, options);
    }
    static getAPIAuthUserFromAuthCredentials(authCredentials) {
        return {
            userID: authCredentials.userID,
            userName: authCredentials.userName,
            extraData: authCredentials.extraData
        };
    }
}
exports.APIAuthUtils = APIAuthUtils;
//# sourceMappingURL=APIAuthUtils.js.map