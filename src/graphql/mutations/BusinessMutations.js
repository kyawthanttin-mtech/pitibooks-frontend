import { gql } from "@apollo/client";

const UPDATE_BUSINESS = gql`
  mutation UpdateBusiness($input: NewBusiness!) {
    updateBusiness(input: $input) {
      id
      logoUrl
      name
      contactName
      email
      phone
      mobile
      website
      about
      address
      country
      city
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
      baseCurrency {
        id
        name
        symbol
        decimalPlaces
      }
      fiscalYear
      reportBasis
      timezone
      companyId
      taxId
      isTaxInclusive
      isTaxExclusive
      primaryBranch {
        id
        name
      }
    }
  }
`;

const BusinessMutations = {
  UPDATE_BUSINESS,
};

export default BusinessMutations;
