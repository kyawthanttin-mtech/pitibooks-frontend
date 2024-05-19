import { gql } from "@apollo/client";

const CREATE_DELIVERY_METHOD = gql`
  mutation CreateDeliveryMethod($input: NewDeliveryMethod!) {
    createDeliveryMethod(input: $input) {
      id
      name
    }
  }
`;

const UPDATE_DELIVERY_METHOD = gql`
  mutation UpdateDeliveryMethod($id: ID!, $input: NewDeliveryMethod!) {
    updateDeliveryMethod(id: $id, input: $input) {
      id
      name
    }
  }
`;
const DELETE_DELIVERY_METHOD = gql`
  mutation DeleteDeliveryMethod($id: ID!) {
    deleteDeliveryMethod(id: $id) {
      id
      name
    }
  }
`;

const TOGGLE_ACTIVE_DELIVERY_METHOD = gql`
  mutation ToggleActiveDeliveryMethod($id: ID!, $isActive: Boolean!) {
    toggleActiveDeliveryMethod(id: $id, isActive: $isActive) {
      id
      name
      isActive
    }
  }
`;

const DeliveryMethodMutations = {
  CREATE_DELIVERY_METHOD,
  UPDATE_DELIVERY_METHOD,
  DELETE_DELIVERY_METHOD,
  TOGGLE_ACTIVE_DELIVERY_METHOD
};

export default DeliveryMethodMutations;
