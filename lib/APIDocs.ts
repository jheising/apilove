import {APIDocsOptions, APIEndpoint, APIEndpointDocsOptions, APILove, APILoveDocsOptions, APILoveOptions} from "../APILove";
import * as express from "express";
import * as path from "path";
import {defaultsDeep, get, has} from "lodash";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import {DocApp} from "./DocGeneration/components/DocApp";

export interface APIEndpointDocData {
    overview: APIEndpointDocsOptions;
    method: string;
    path: string;
}

export interface APIDocData {
    overview: APIDocsOptions;
    path: string;
    endpoints: APIEndpointDocData[];
}

export interface APILoveDocData {
    overview: APILoveDocsOptions;
    apis: APIDocData[];
}

export class APIDocs {

    static getAPIDocData(options: APILoveOptions): APILoveDocData {
        let docData: APILoveDocData = {
            overview: get(options, "docs"),
            apis: []
        };

        let apiMetadata = APILove.getAPIMetadata(options);

        for (let metadata of apiMetadata) {
            if (has(metadata, "apiOptions.docs")) {

                let apiDocs: APIDocData = {
                    overview: get(metadata, "apiOptions.docs"),
                    path: metadata.path,
                    endpoints: []
                };

                if (has(metadata, "endpointOptions")) {
                    for(let endpointOption of metadata.endpointOptions)
                    {
                        if (has(endpointOption, "docs")) {
                            let endpointDocs: APIEndpointDocData = {
                                overview: endpointOption.docs,
                                method: get(endpointOption, "method", "GET").toUpperCase(),
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

    @APIEndpoint({
        path: "*",
        middleware: [express.static(path.join(__dirname, "DocGeneration/dist"))]
    })
    static async renderDocs(req, res) {

        let apiDocs: APILoveDocsOptions = defaultsDeep(get(req, "APILove.options.docs", {}), {
            title: "API Docs"
        } as APILoveDocsOptions);

        let docComponent = React.createElement(DocApp, {
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
    }
}