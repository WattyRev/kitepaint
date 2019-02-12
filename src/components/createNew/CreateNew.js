import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import CreateNewContainer from "../../containers/CreateNewContainer";
import EditorContainer from "../../containers/EditorContainer";
import UserContainer from "../../containers/UserContainer";
import { PageLoader } from "../../theme";
import Toolbar from "../editor/Toolbar";
import Sidebar from "../editor/Sidebar";
import Canvas from "../editor/Canvas";
import ProductNotes from "../editor/ProductNotes";
import ErrorPage from "../ErrorPage";

const PageLayout = styled.div`
  display: flex;
  justify-content: stretch;
  position: relative;

  .product-notes {
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    bottom: 0;
    right: 0;
    padding: 8px;
    max-width: calc(100% - 200px);
  }
`;

/**
 * A coordinating component that builds the CreatNew page.
 * The CreateNew page is provided a productId from the router, and is intended to create a new
 * design based on that product.
 */
const CreateNew = ({ match }) => (
  <CreateNewContainer productId={match.params.productId}>
    {createNewData => {
      if (createNewData.props.isLoading) {
        return <PageLoader />;
      }
      if (!createNewData.props.product) {
        return <ErrorPage />;
      }
      return (
        <EditorContainer product={createNewData.props.product}>
          {editorData => (
            <React.Fragment>
              <UserContainer>
                {userData => (
                  <Toolbar
                    hideOutlines={editorData.props.hideOutlines}
                    onAutofill={editorData.actions.autofill}
                    onBackgroundChange={editorData.actions.changeBackground}
                    onHideOutlines={editorData.actions.toggleHideOutlines}
                    onSave={name => {
                      editorData.actions.save({
                        name,
                        user: userData.props.isLoggedIn
                          ? userData.props.id
                          : "0"
                      });
                    }}
                    onRedo={editorData.actions.redo}
                    onReset={editorData.actions.reset}
                    onUndo={editorData.actions.undo}
                    redoDisabled={!editorData.props.canRedo}
                    undoDisabled={!editorData.props.canUndo}
                  />
                )}
              </UserContainer>
              <PageLayout>
                <Sidebar
                  product={createNewData.props.product}
                  manufacturer={createNewData.props.manufacturer}
                  selectedVariation={editorData.props.currentVariation.name}
                  selectedColor={editorData.props.currentColor.name}
                  onColorSelect={editorData.actions.selectColor}
                  onVariationSelect={editorData.actions.selectVariation}
                  appliedColors={editorData.props.appliedColors}
                />
                <Canvas
                  background={editorData.props.background}
                  hideOutlines={editorData.props.hideOutlines}
                  colorMap={editorData.props.currentVariationColors}
                  svg={editorData.props.currentVariation.svg}
                  onClick={editorData.actions.applyColor}
                  currentColor={editorData.props.currentColor.name}
                />
                {createNewData.props.product.get("notes") &&
                  !!createNewData.props.product.get("notes").length && (
                    <ProductNotes
                      notes={createNewData.props.product.get("notes")}
                    />
                  )}
              </PageLayout>
            </React.Fragment>
          )}
        </EditorContainer>
      );
    }}
  </CreateNewContainer>
);

CreateNew.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      productId: PropTypes.string.isRequired
    })
  })
};

export default CreateNew;
