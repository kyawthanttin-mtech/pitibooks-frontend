import { gql } from "@apollo/client";

const CREATE_SHIPMENT_PREFERENCE = gql`
  mutation CreateShipmentPreference($input: NewShipmentPreference!) {
    createShipmentPreference(input: $input) {
      id
      name
    }
  }
`;

const UPDATE_SHIPMENT_PREFERENCE = gql`
  mutation CreateShipmentPreference($input: NewShipmentPreference!, $id: ID!) {
    updateShipmentPreference(input: $input, id: $id) {
      id
      name
    }
  }
`;
const DELETE_SHIPMENT_PREFERENCE = gql`
  mutation DeleteShipmentPreference($id: ID!) {
    deleteShipmentPreference(id: $id) {
      id
      name
    }
  }
`;

const TOGGLE_ACTIVE_SHIPMENT_PREFERENCE = gql`
  mutation ToggleActiveShipmentPreference($id: ID!, $isActive: Boolean!) {
    toggleActiveShipmentPreference(id: $id, isActive: $isActive) {
      id
      name
      isActive
    }
  }
`;

const ShipmentPreferenceMutations = {
  CREATE_SHIPMENT_PREFERENCE,
  UPDATE_SHIPMENT_PREFERENCE,
  DELETE_SHIPMENT_PREFERENCE,
  TOGGLE_ACTIVE_SHIPMENT_PREFERENCE,
};

export default ShipmentPreferenceMutations;
