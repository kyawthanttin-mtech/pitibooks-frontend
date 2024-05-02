import { gql } from "@apollo/client";

const GET_DELIVERY_METHODS = gql`
  query ListDeliveryMethod {
    listDeliveryMethod {
      id
      businessId
      name
      isActive
      createdAt
      updatedAt
    }
  }
`;

const DeliveryMethodQueries = {
  GET_DELIVERY_METHODS,
};

export default DeliveryMethodQueries;
