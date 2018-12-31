import React from "react";
import styled from "styled-components";
import MyDesignsContainer from "../../containers/MyDesignsContainer";
import { H1, Spacer, PageLoader } from "../../theme";
import DesignManager from "./DesignManager";

const StyleWrapper = styled.div`
  padding: 8px 16px;
  margin: 0 auto;
  max-width: 1280px;
`;

/**
 * A coordinating component for the My Designs page.
 * The page is intended to allow users to see and manage their designs
 */
const MyDesigns = () => (
  <StyleWrapper>
    <H1>My Designs</H1>
    <Spacer bottom="md" />
    <MyDesignsContainer>
      {userDesigns =>
        userDesigns.props.isLoading ? (
          <PageLoader />
        ) : (
          userDesigns.props.designs.map(design => {
            const product = userDesigns.props.products[design.product];
            const manufacturer = product
              ? userDesigns.props.manufacturers[product.manufacturer]
              : null;
            return (
              <Spacer key={design.id} bottom="md">
                <DesignManager
                  onDelete={() => userDesigns.actions.deleteDesign(design.id)}
                  design={design}
                  product={product}
                  manufacturer={manufacturer}
                />
              </Spacer>
            );
          })
        )
      }
    </MyDesignsContainer>
  </StyleWrapper>
);

export default MyDesigns;
