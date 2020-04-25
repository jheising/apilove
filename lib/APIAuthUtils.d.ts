export declare class APIAuthCredentials {
    isAuthenticated: boolean;
    userID?: string;
    userName?: string;
    expires?: number;
    refreshToken?: string;
    rawJWTPayload?: object;
}
export declare class APIAuthUtils {
    static setJWTSessionCookie(res: any, jwtToken: string, domain: string): void;
    static deleteJWTSessionCookie(res: any, domain: string): void;
    private static getAuthCredentialsFromJWT;
    static getJWTFromRequest(req: any): string;
    static getAuthCredentialsFromRequest(req: any, allowExpired?: boolean): APIAuthCredentials;
    static createJWT(userID: string, username: string, refreshToken: string, expiresIn?: string | number, extraData?: object): string;
}
