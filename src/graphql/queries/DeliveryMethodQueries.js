import { gql } from "@apollo/client";

const GET_DELIVERY_METHODS = gql`
  query ListDeliveryMethod {
    listDeliveryMethod {
      id
      name
      isActive
    }
  }
`;

const GET_ALL_DELIVERY_METHODS = gql`
  query ListAllDeliveryMethod {
    listAllDeliveryMethod {
      id
      name
      isActive
    }
  }
`;

const DeliveryMethodQueries = {
  GET_DELIVERY_METHODS,
  GET_ALL_DELIVERY_METHODS,
};

export default DeliveryMethodQueries;
