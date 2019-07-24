"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const APILove_1 = require("../APILove");
class SampleAPI {
    static staticFunc(what, // This will be retrieved as a string from the URL
    data, // The body will be parsed and sent back here
    req, // Access the raw express.js request
    res // Access the raw express.js response
    ) {
        return new Promise((resolve, reject) => {
            resolve(data);
        });
    }
    instanceFunc(what, // This will be retrieved as a string from the URL
    data, // The body will be parsed and sent back here
    req, // Access the raw express.js request
    res // Access the raw express.js response
    ) {
        return new Promise((resolve, reject) => {
            resolve(data);
        });
    }
}
__decorate([
    APILove_1.APIEndpoint({
        method: "POST",
        path: "/foo/:what"
    }),
    __param(0, APILove_1.APIParameter({
        optional: true
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SampleAPI.prototype, "instanceFunc", null);
__decorate([
    APILove_1.APIEndpoint({
        method: "POST",
        path: "/foo/:what"
    }),
    __param(1, APILove_1.APIParameter({
        optional: true
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SampleAPI, "staticFunc", null);
exports.SampleAPI = SampleAPI;
//# sourceMappingURL=SampleAPI.js.map