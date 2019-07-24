import * as React from "react";
import * as ReactMarkdown from "react-markdown/with-html";

export interface DocMarkdownProps {
    content?:string;
}

export class DocMarkdown extends React.PureComponent<DocMarkdownProps>
{
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="content"><ReactMarkdown source={this.props.content} escapeHtml={false}/></div>
    }
}