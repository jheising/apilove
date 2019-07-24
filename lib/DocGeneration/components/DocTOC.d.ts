import * as React from "react";
import { APIDocData, APILoveDocData } from "../../APIDocs";
export interface DocTOCProps {
    docData: APILoveDocData;
}
export declare class DocTOC extends React.PureComponent<DocTOCProps> {
    renderEndpoints(apiDocData: APIDocData): JSX.Element;
    renderAPIs(): any;
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined;
}
