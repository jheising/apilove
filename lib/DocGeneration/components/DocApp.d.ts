import * as React from "react";
import { APILoveDocData } from "../../APIDocs";
export interface DocAppProps {
    docData: APILoveDocData;
}
export declare class DocApp extends React.PureComponent<DocAppProps> {
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined;
}
