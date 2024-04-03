import { gql } from "@apollo/client";

const GET_ALL_TOWNSHIPS = gql`
  query GetAllTownships {
    listAllTownship {
      id
      stateCode
      townshipNameEn
      townshipNameMm
      isActive
    }
  }
`;

const TownshipQueries = {
  GET_ALL_TOWNSHIPS,
};

export default TownshipQueries;
