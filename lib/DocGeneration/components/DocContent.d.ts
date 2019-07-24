import * as React from "react";
import { APIDocData, APIEndpointDocData, APILoveDocData } from "../../APIDocs";
export interface DocContentProps {
    docData: APILoveDocData;
}
export declare class DocContent extends React.PureComponent<DocContentProps> {
    renderEndpoint(endpointDoc: APIEndpointDocData): JSX.Element;
    renderAPIDoc(apiDoc: APIDocData): JSX.Element;
    renderAPIDocs(): any;
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined;
}
