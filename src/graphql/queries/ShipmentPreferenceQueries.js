import { gql } from "@apollo/client";

const GET_ALL_SHIPMENT_PREFERENCES = gql`
  query ListAllShipmentPreference {
    listAllShipmentPreference {
      id
      name
      isActive
    }
  }
`;

const ShipmentPreferenceQueries = {
  GET_ALL_SHIPMENT_PREFERENCES,
};

export default ShipmentPreferenceQueries;
