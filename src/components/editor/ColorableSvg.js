import React from "react";
import PropTypes from "prop-types";
import { appliedColorsShape } from "../../containers/EditorContainer";

/**
 * Renders the provided SVG and uses the colorMap to apply a fill color to verious elements
 */
class ColorableSvg extends React.Component {
  static propTypes = {
    svg: PropTypes.string.isRequired,
    colorMap: appliedColorsShape.isRequired
  };

  componentDidMount() {
    this.applyColors();
  }

  componentDidUpdate() {
    this.applyColors();
  }

  /**
   * A DOM reference to the div containing the SVG
   */
  node = null;

  /**
   * Applies the colorMap to the rendered SVG
   */
  applyColors = () => {
    const { colorMap } = this.props;
    Object.keys(colorMap).forEach(id => {
      const color = colorMap[id].color;
      const panel = this.node.querySelectorAll(`[data-id="${id}"]`)[0];
      panel.setAttribute("fill", color);
    });
  };

  render() {
    return (
      <div
        ref={node => (this.node = node)}
        dangerouslySetInnerHTML={{ __html: this.props.svg }}
      />
    );
  }
}

export default ColorableSvg;