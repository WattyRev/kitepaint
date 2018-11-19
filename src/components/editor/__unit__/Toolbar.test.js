import React from "react";
import { mount, shallow } from "enzyme";
import { ThemeProvider } from "styled-components";
import Theme from "../../../theme";
import { setupFontAwesome } from "../../../theme/Icon";
import Toolbar, { StyleWrapper } from "../Toolbar";

describe("Toolbar", () => {
  describe("StyleWrapper", () => {
    it("renders", () => {
      expect.assertions(1);
      const wrapper = mount(<StyleWrapper theme={Theme} />);
      expect(wrapper.find("div")).toHaveLength(1);
    });
  });

  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      onShare: jest.fn(),
      onReset: jest.fn(),
      onHideOutlines: jest.fn(),
      onBackgroundChange: jest.fn()
    };
    setupFontAwesome();
  });
  it("renders", () => {
    expect.assertions(1);
    const wrapper = shallow(<Toolbar {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("does not display the save button is no onSave is provided", () => {
    expect.assertions(1);
    defaultProps.onSave = null;
    const wrapper = mount(
      <ThemeProvider theme={Theme}>
        <Toolbar {...defaultProps} />
      </ThemeProvider>
    );
    expect(wrapper.find("P.testing_save")).toHaveLength(0);
  });
  it("displays the save button if onSave is provided", () => {
    expect.assertions(1);
    defaultProps.onSave = jest.fn();
    const wrapper = mount(
      <ThemeProvider theme={Theme}>
        <Toolbar {...defaultProps} />
      </ThemeProvider>
    );
    expect(wrapper.find("P.testing_save")).toHaveLength(1);
  });
  it("does not display the autofill button if no onAutofill is provided", () => {
    expect.assertions(1);
    defaultProps.onAutofill = null;
    const wrapper = mount(
      <ThemeProvider theme={Theme}>
        <Toolbar {...defaultProps} />
      </ThemeProvider>
    );
    expect(wrapper.find("P.testing_autofill")).toHaveLength(0);
  });
  it("displays the autofill button if onAutofill is provided", () => {
    expect.assertions(1);
    defaultProps.onAutofill = jest.fn();
    const wrapper = mount(
      <ThemeProvider theme={Theme}>
        <Toolbar {...defaultProps} />
      </ThemeProvider>
    );
    expect(wrapper.find("P.testing_autofill")).toHaveLength(1);
  });
});