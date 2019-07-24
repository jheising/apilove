import * as React from "react";
//import * as ReactMarkdown from "react-markdown/with-html";
//import {isEmpty} from "lodash";

export interface DocSectionProps {
}

export class DocSection extends React.PureComponent<DocSectionProps> {

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="section doc-section">
            <div className="container">
                {this.props.children}
            </div>
        </div>
    }
}