"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class DocSection extends React.PureComponent {
    render() {
        return React.createElement("div", { className: "section doc-section" },
            React.createElement("div", { className: "container" }, this.props.children));
    }
}
exports.DocSection = DocSection;
//# sourceMappingURL=DocSection.js.map