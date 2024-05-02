import { gql } from "@apollo/client";

const CREATE_DELIVERY_METHOD = gql`
  mutation CreateDeliveryMethod($input: NewDeliveryMethod!) {
    createDeliveryMethod(input: $input) {
      id
      businessId
      name
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_DELIVERY_METHOD = gql`
  mutation UpdateDeliveryMethod($id: ID!, $input: NewDeliveryMethod!) {
    updateDeliveryMethod(id: $id, input: $input) {
      id
      businessId
      name
      createdAt
      updatedAt
    }
  }
`;
const DELETE_DELIVERY_METHOD = gql`
  mutation DeleteDeliveryMethod($id: ID!) {
    deleteDeliveryMethod(id: $id) {
      id
      businessId
      name
      createdAt
      updatedAt
    }
  }
`;

const DeliveryMethodMutations = {
  CREATE_DELIVERY_METHOD,
  UPDATE_DELIVERY_METHOD,
  DELETE_DELIVERY_METHOD,
};

export default DeliveryMethodMutations;
