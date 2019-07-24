"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const lodash_1 = require("lodash");
class DocTOC extends React.PureComponent {
    renderEndpoints(apiDocData) {
        if (lodash_1.isEmpty(apiDocData.endpoints)) {
            return null;
        }
        return React.createElement("ul", null, lodash_1.map(apiDocData.endpoints, (endpointDocData, index) => {
            return React.createElement("li", { key: index },
                React.createElement("a", null, endpointDocData.overview.title));
        }));
    }
    renderAPIs() {
        return lodash_1.map(this.props.docData.apis, (apiDocData, index) => {
            return React.createElement("li", { key: index },
                React.createElement("a", null, apiDocData.overview.title),
                this.renderEndpoints(apiDocData));
        });
    }
    render() {
        return React.createElement("aside", { className: "doc-toc menu" },
            React.createElement("ul", { className: "menu-list" },
                React.createElement("li", null,
                    React.createElement("a", null, "Introduction"))),
            React.createElement("p", { className: "menu-label" }, "APIs"),
            React.createElement("ul", { className: "menu-list" }, this.renderAPIs()));
    }
}
exports.DocTOC = DocTOC;
//# sourceMappingURL=DocTOC.js.map