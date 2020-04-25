export declare class APIAuthUser<T = any> {
    userID: string;
    userName: string;
    extraData?: T;
}
export declare class APIAuthCredentials extends APIAuthUser {
    isAuthenticated: boolean;
    isExpired: boolean;
    expires?: Date;
    refreshToken?: string;
    rawJWTPayload?: object;
}
export declare class APIAuthUtils {
    static setJWTSessionCookie(res: any, jwtToken: string, domain: string): void;
    static deleteJWTSessionCookie(res: any, domain: string): void;
    private static getAuthCredentialsFromJWT;
    static getJWTFromRequest(req: any): string;
    static getAuthCredentialsFromRequest(req: any, allowExpired?: boolean): APIAuthCredentials;
    static createJWT(userID: string, username: string, expiresIn?: string | number, refreshToken?: string, extraData?: object): string;
    static getAPIAuthUserFromAuthCredentials<T = any>(authCredentials: APIAuthCredentials): APIAuthUser<T>;
}
