import * as React from "react";
import {DocSection} from "./DocSection";
import {APIDocData, APIEndpointDocData, APILoveDocData} from "../../APIDocs";
import {map} from "lodash";
import {DocMarkdown} from "./DocMarkdown";

export interface DocContentProps {
    docData: APILoveDocData;
}

export class DocContent extends React.PureComponent<DocContentProps> {
    renderEndpoint(endpointDoc: APIEndpointDocData) {

        let methodClass = "is-info";

        switch (endpointDoc.method) {
            case "POST":
                methodClass = "is-warning";
                break;
            case "GET":
                methodClass = "is-success";
                break;
            case "DELETE":
                methodClass = "is-danger";
                break;
        }

        return <React.Fragment>
            <hr/>
            <div className="columns">
                <div className="column is-half">
                    <h2 className="subtitle">{endpointDoc.overview.title}</h2>
                    <div className="endpoint is-family-monospace"><span className={`tag ${methodClass}`}>{endpointDoc.method}</span> <span>{endpointDoc.path}</span></div>
                    <DocMarkdown content={endpointDoc.overview.description}/>
                </div>
            </div>
        </React.Fragment>
    }

    renderAPIDoc(apiDoc: APIDocData) {
        return <DocSection>
            <h1 className="title">{apiDoc.overview.title}</h1>
            <DocMarkdown content={apiDoc.overview.intro}/>
            {map(apiDoc.endpoints, (endpointDoc: APIEndpointDocData, index) => <React.Fragment key={index}>{this.renderEndpoint(endpointDoc)}</React.Fragment>)}
        </DocSection>;
    }

    renderAPIDocs() {
        return map(this.props.docData.apis, (apiDoc: APIDocData, index) => {
            return <React.Fragment key={index}>
                {this.renderAPIDoc(apiDoc)}
            </React.Fragment>
        });
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="doc-content">
            <DocSection>
                <DocMarkdown content={this.props.docData.overview.intro}/>
            </DocSection>
            {this.renderAPIDocs()}
        </div>;
    }
}