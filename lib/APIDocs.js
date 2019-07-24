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
const express = require("express");
const path = require("path");
const lodash_1 = require("lodash");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const DocApp_1 = require("./DocGeneration/components/DocApp");
class APIDocs {
    static getAPIDocData(options) {
        let docData = {
            overview: lodash_1.get(options, "docs"),
            apis: []
        };
        let apiMetadata = APILove_1.APILove.getAPIMetadata(options);
        for (let metadata of apiMetadata) {
            if (lodash_1.has(metadata, "apiOptions.docs")) {
                let apiDocs = {
                    overview: lodash_1.get(metadata, "apiOptions.docs"),
                    path: metadata.path,
                    endpoints: []
                };
                if (lodash_1.has(metadata, "endpointOptions")) {
                    for (let endpointOption of metadata.endpointOptions) {
                        if (lodash_1.has(endpointOption, "docs")) {
                            let endpointDocs = {
                                overview: endpointOption.docs,
                                method: lodash_1.get(endpointOption, "method", "GET").toUpperCase(),
                                path: path.join(metadata.path, endpointOption.path)
                            };
                            apiDocs.endpoints.push(endpointDocs);
                        }
                    }
                }
                docData.apis.push(apiDocs);
            }
        }
        return docData;
    }
    static renderDocs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let apiDocs = lodash_1.defaultsDeep(lodash_1.get(req, "APILove.options.docs", {}), {
                title: "API Docs"
            });
            let docComponent = React.createElement(DocApp_1.DocApp, {
                docData: APIDocs.getAPIDocData(req.APILove.options)
            });
            let docString = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${apiDocs.title}</title>
    <link rel="stylesheet" href="css/styles.css">
  </head>
  <body>
  <div id="root">${ReactDOMServer.renderToStaticMarkup(docComponent)}</div>
  </body>
</html>`;
            res.set('Content-Type', 'text/html');
            res.write(docString);
            res.end();
        });
    }
}
__decorate([
    APILove_1.APIEndpoint({
        path: "*",
        middleware: [express.static(path.join(__dirname, "DocGeneration/dist"))]
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], APIDocs, "renderDocs", null);
exports.APIDocs = APIDocs;
//# sourceMappingURL=APIDocs.js.map