import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { PageLoader } from "../../theme";
import ViewContainer from "../../containers/ViewContainer";
import Toolbar from "../editor/Toolbar";
import Sidebar from "./Sidebar";
import Canvas from "../editor/Canvas";
import ErrorPage from "../ErrorPage";

const PageLayout = styled.div`
  display: flex;
  justify-content: stretch;
  position: relative;
`;

const View = ({ match }) => (
  <ViewContainer designId={match.params.designId}>
    {designData => {
      if (designData.props.isLoading) {
        return <PageLoader />;
      }
      if (!designData.props.design) {
        return <ErrorPage />;
      }
      return (
        <React.Fragment>
          <Toolbar
            onShare={() => {}}
            onHideOutlines={() => {}}
            onBackgroundChange={() => {}}
          />
          <PageLayout>
            <Sidebar
              manufacturer={designData.props.manufacturer}
              product={designData.props.product}
              design={designData.props.design}
              selectedVariation={designData.props.currentVariation.name}
              usedColors={designData.props.usedColors}
              user={designData.props.user}
              onVariationSelect={designData.actions.selectVariation}
            />
            <Canvas svg={designData.props.currentVariation.svg} isReadOnly />
          </PageLayout>
        </React.Fragment>
      );
    }}
  </ViewContainer>
);

View.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      designId: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default View;
