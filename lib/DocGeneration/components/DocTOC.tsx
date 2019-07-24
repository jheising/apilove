import * as React from "react";
import {APIDocData, APIEndpointDocData, APILoveDocData} from "../../APIDocs";
import {map, isEmpty} from "lodash";

export interface DocTOCProps {
    docData: APILoveDocData;
}

export class DocTOC extends React.PureComponent<DocTOCProps> {
    renderEndpoints(apiDocData: APIDocData) {
        if (isEmpty(apiDocData.endpoints)) {
            return null;
        }

        return <ul>
            {map(apiDocData.endpoints, (endpointDocData: APIEndpointDocData, index) => {
                return <li key={index}>
                    <a>{endpointDocData.overview.title}</a>
                </li>
            })}
        </ul>;
    }

    renderAPIs() {
        return map(this.props.docData.apis, (apiDocData: APIDocData, index) => {
            return <li key={index}>
                <a>{apiDocData.overview.title}</a>
                {this.renderEndpoints(apiDocData)}
            </li>
        });
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <aside className="doc-toc menu">
            <ul className="menu-list">
                <li><a>Introduction</a></li>
            </ul>
            <p className="menu-label">
                APIs
            </p>
            <ul className="menu-list">
                {this.renderAPIs()}
            </ul>
        </aside>;
    }
}