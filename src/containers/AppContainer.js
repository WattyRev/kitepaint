import React from "react";
import PropTypes from "prop-types";
import { ThemeProvider } from "styled-components";
import { BrowserRouter } from "react-router-dom";
import { connect } from "react-redux";
import Theme from "../theme";
import { CHECK_LOGIN } from "../redux/actions";
import { getCheckingLogin } from "../redux/modules/user";
import { setupFontAwesome } from "../theme/Icon";
import { PageLoader } from "../theme";
import App from "../components/App";

setupFontAwesome();

export class AppContainer extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    isCheckingLogin: PropTypes.bool.isRequired,
    onCheckLogin: PropTypes.func.isRequired
  };

  constructor(props, ...rest) {
    super(props, ...rest);
    props.onCheckLogin();
  }

  render() {
    if (this.props.isCheckingLogin) {
      return <PageLoader />;
    }
    return (
      <BrowserRouter>
        <ThemeProvider theme={Theme}>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    );
  }
}

const mapStateToProps = state => ({
  isCheckingLogin: getCheckingLogin(state)
});

const mapDispatchToProps = {
  onCheckLogin: CHECK_LOGIN
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppContainer);
