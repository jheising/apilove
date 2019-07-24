import * as React from "react";
import {DocTOC} from "./DocTOC";
import {DocContent} from "./DocContent";
import {APILoveDocData} from "../../APIDocs";

export interface DocAppProps {
    docData:APILoveDocData;
}

export class DocApp extends React.PureComponent<DocAppProps>
{
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="doc-container">
            <DocTOC docData={this.props.docData}/>
            <DocContent docData={this.props.docData}/>
        </div>
    }
}
