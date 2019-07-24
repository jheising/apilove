"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const DocTOC_1 = require("./DocTOC");
const DocContent_1 = require("./DocContent");
class DocApp extends React.PureComponent {
    render() {
        return React.createElement("div", { className: "doc-container" },
            React.createElement(DocTOC_1.DocTOC, { docData: this.props.docData }),
            React.createElement(DocContent_1.DocContent, { docData: this.props.docData }));
    }
}
exports.DocApp = DocApp;
//# sourceMappingURL=DocApp.js.map