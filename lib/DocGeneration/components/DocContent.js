"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const DocSection_1 = require("./DocSection");
const lodash_1 = require("lodash");
const DocMarkdown_1 = require("./DocMarkdown");
class DocContent extends React.PureComponent {
    renderEndpoint(endpointDoc) {
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
        return React.createElement(React.Fragment, null,
            React.createElement("hr", null),
            React.createElement("div", { className: "columns" },
                React.createElement("div", { className: "column is-half" },
                    React.createElement("h2", { className: "subtitle" }, endpointDoc.overview.title),
                    React.createElement("div", { className: "endpoint is-family-monospace" },
                        React.createElement("span", { className: `tag ${methodClass}` }, endpointDoc.method),
                        " ",
                        React.createElement("span", null, endpointDoc.path)),
                    React.createElement(DocMarkdown_1.DocMarkdown, { content: endpointDoc.overview.description }))));
    }
    renderAPIDoc(apiDoc) {
        return React.createElement(DocSection_1.DocSection, null,
            React.createElement("h1", { className: "title" }, apiDoc.overview.title),
            React.createElement(DocMarkdown_1.DocMarkdown, { content: apiDoc.overview.intro }),
            lodash_1.map(apiDoc.endpoints, (endpointDoc, index) => React.createElement(React.Fragment, { key: index }, this.renderEndpoint(endpointDoc))));
    }
    renderAPIDocs() {
        return lodash_1.map(this.props.docData.apis, (apiDoc, index) => {
            return React.createElement(React.Fragment, { key: index }, this.renderAPIDoc(apiDoc));
        });
    }
    render() {
        return React.createElement("div", { className: "doc-content" },
            React.createElement(DocSection_1.DocSection, null,
                React.createElement(DocMarkdown_1.DocMarkdown, { content: this.props.docData.overview.intro })),
            this.renderAPIDocs());
    }
}
exports.DocContent = DocContent;
//# sourceMappingURL=DocContent.js.map