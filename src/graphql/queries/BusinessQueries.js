import { gql } from "@apollo/client";

const GET_BUSINESS = gql`
  query GetBusiness {
    getBusiness {
      id
      name
      state {
        id
        code
        stateNameEn
      }
      township {
        id
        code
        stateCode
        townshipNameEn
      }
      phone
      mobile
      email
      isTaxExclusive
      isTaxInclusive
      fiscalYear
      address
      country
      city
      reportBasis
      companyId
      taxId
      baseCurrency {
        id
        name
        symbol
        decimalPlaces
      }
      primaryBranch {
        id
        name
      }
      isActive
    }
  }
`;

const BusinessQueries = {
  GET_BUSINESS,
};

export default BusinessQueries;
