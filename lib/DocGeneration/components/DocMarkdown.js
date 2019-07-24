"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactMarkdown = require("react-markdown/with-html");
class DocMarkdown extends React.PureComponent {
    render() {
        return React.createElement("div", { className: "content" },
            React.createElement(ReactMarkdown, { source: this.props.content, escapeHtml: false }));
    }
}
exports.DocMarkdown = DocMarkdown;
//# sourceMappingURL=DocMarkdown.js.map