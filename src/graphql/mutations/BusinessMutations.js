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
      migrationDate
      salesTransactionLockDate
      purchaseTransactionLockDate
      bankingTransactionLockDate
      accountantTransactionLockDate
      primaryBranch {
        id
        name
      }
    }
  }
`;

const UPDATE_TRANSACTION_LOCKING = gql`
  mutation UpdateTransactionLocking($input: NewTransactionLocking!) {
    updateTransactionLocking(input: $input) {
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
    }
  }
`;

const BusinessMutations = {
  UPDATE_BUSINESS,
  UPDATE_TRANSACTION_LOCKING,
};

export default BusinessMutations;
