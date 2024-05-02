import { gql } from "@apollo/client";

const CREATE_SHIPMENT_PREFERENCE = gql`
  mutation CreateShipmentPreference($input: NewShipmentPreference!) {
    createShipmentPreference(input: $input) {
      id
      businessId
      name
      isActive
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_SHIPMENT_PREFERENCE = gql`
  mutation CreateShipmentPreference($input: NewShipmentPreference!, $id: ID!) {
    updateShipmentPreference(input: $input, id: $id) {
      id
      businessId
      name
      isActive
      createdAt
      updatedAt
    }
  }
`;
const DELETE_SHIPMENT_PREFERENCE = gql`
  mutation DeleteShipmentPreference($id: ID!) {
    deleteShipmentPreference(id: $id) {
      id
      businessId
      name
      isActive
      createdAt
      updatedAt
    }
  }
`;

const TOGGLE_ACTIVE_SHIPMENT_PREFERENCE = gql`
  mutation ToggleActiveProductUnit($id: ID!, $isActive: Boolean!) {
    toggleActiveProductUnit(id: $id, isActive: $isActive) {
      id
      businessId
      name
      abbreviation
      precision
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
