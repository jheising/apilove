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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const APILove_1 = require("../APILove");
let TempStorageAPI = class TempStorageAPI {
    static storeData() {
        return __awaiter(this, void 0, void 0, function* () {
            return "Hello!";
        });
    }
    static testEndpoint2() {
        return __awaiter(this, void 0, void 0, function* () {
            return "Hello!";
        });
    }
};
__decorate([
    APILove_1.APIEndpoint({
        path: "/endpoint1",
        docs: {
            title: "Endpoint 1",
            description: "This is a cool endpoint!"
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TempStorageAPI, "storeData", null);
__decorate([
    APILove_1.APIEndpoint({
        path: "/endpoint2",
        method: "POST",
        docs: {
            title: "Endpoint 2",
            description: "This is another cool endpoint!"
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TempStorageAPI, "testEndpoint2", null);
TempStorageAPI = __decorate([
    APILove_1.API({
        docs: {
            title: "Storage API",
            intro: "`yo` shit!"
        }
    })
], TempStorageAPI);
exports.TempStorageAPI = TempStorageAPI;
//# sourceMappingURL=TempStorageAPI.js.map