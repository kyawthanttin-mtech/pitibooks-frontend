import { gql } from "@apollo/client";

const GET_BUSINESS = gql`
  query GetBusiness {
    getBusiness {
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
      migrationDate
      salesTransactionLockDate
      purchaseTransactionLockDate
      bankingTransactionLockDate
      accountantTransactionLockDate
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
