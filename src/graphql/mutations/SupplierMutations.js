import { gql } from "@apollo/client";

const CREATE_SUPPLIER = gql`
  mutation CreateSupplier($input: NewSupplier!) {
    createSupplier(input: $input) {
      id
      name
      email
      phone
      mobile
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      supplierTax {
        id
        name
        rate
        type
        isActive
      }
      openingBalanceBranchId
      openingBalance
      exchangeRate
      supplierPaymentTerms
      supplierPaymentTermsCustomDays
      notes
      prepaidCreditAmount
      unusedCreditAmount
      billingAddress {
        id
        attention
        address
        country
        city
        email
        phone
        mobile
        referenceType
        referenceID
      }
      shippingAddress {
        id
        attention
        address
        country
        city
        stateId
        townshipId
        email
        phone
        mobile
        referenceType
        referenceID
      }
      contactPersons {
        id
        name
        email
        phone
        mobile
        designation
        department
        referenceType
        referenceID
      }
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
    }
  }
`;

const UPDATE_SUPPLIER = gql`
  mutation UpdateSupplier($id: ID!, $input: NewSupplier!) {
    updateSupplier(id: $id, input: $input) {
      id
      name
      email
      phone
      mobile
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      supplierTax {
        id
        name
        rate
        type
        isActive
      }
      openingBalanceBranchId
      openingBalance
      exchangeRate
      supplierPaymentTerms
      supplierPaymentTermsCustomDays
      notes
      prepaidCreditAmount
      unusedCreditAmount
      billingAddress {
        id
        attention
        address
        country
        city
        email
        phone
        mobile
        referenceType
        referenceID
      }
      shippingAddress {
        id
        attention
        address
        country
        city
        stateId
        townshipId
        email
        phone
        mobile
        referenceType
        referenceID
      }
      contactPersons {
        id
        name
        email
        phone
        mobile
        designation
        department
        referenceType
        referenceID
      }
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
    }
  }
`;
const DELETE_SUPPLIER = gql`
  mutation DeleteSupplier($id: ID!) {
    deleteSupplier(id: $id) {
      id
      name
      email
      phone
      mobile
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      supplierTax {
        id
        name
        rate
        type
        isActive
      }
      openingBalanceBranchId
      openingBalance
      exchangeRate
      supplierPaymentTerms
      supplierPaymentTermsCustomDays
      notes
      prepaidCreditAmount
      unusedCreditAmount
      billingAddress {
        id
        attention
        address
        country
        city
        email
        phone
        mobile
        referenceType
        referenceID
      }
      shippingAddress {
        id
        attention
        address
        country
        city
        stateId
        townshipId
        email
        phone
        mobile
        referenceType
        referenceID
      }
      contactPersons {
        id
        name
        email
        phone
        mobile
        designation
        department
        referenceType
        referenceID
      }
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
    }
  }
`;

const TOGGLE_ACTIVE_SUPPLIER = gql`
  mutation ToggleActiveSupplier($id: ID!, $isActive: Boolean!) {
    toggleActiveSupplier(id: $id, isActive: $isActive) {
      id
      name
      email
      phone
      mobile
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      supplierTax {
        id
        name
        rate
        type
        isActive
      }
      openingBalanceBranchId
      openingBalance
      exchangeRate
      supplierPaymentTerms
      supplierPaymentTermsCustomDays
      notes
      prepaidCreditAmount
      unusedCreditAmount
      billingAddress {
        id
        attention
        address
        country
        city
        email
        phone
        mobile
        referenceType
        referenceID
      }
      shippingAddress {
        id
        attention
        address
        country
        city
        stateId
        townshipId
        email
        phone
        mobile
        referenceType
        referenceID
      }
      contactPersons {
        id
        name
        email
        phone
        mobile
        designation
        department
        referenceType
        referenceID
      }
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      isActive
    }
  }
`;

const CREATE_SUPPLIER_APPLY_CREDIT = gql`
  mutation CreateSupplierApplyCredit($input: NewBillApplyToSupplierCredit!) {
    createSupplierApplyCredit(input: $input) {
      id
      businessId
      referenceId
      referenceType
      supplierCreditNumber
      billId
      billNumber
      creditDate
      amount
      createdAt
      updatedAt
    }
  }
`;

const SupplierMutations = {
  CREATE_SUPPLIER,
  UPDATE_SUPPLIER,
  DELETE_SUPPLIER,
  TOGGLE_ACTIVE_SUPPLIER,
  CREATE_SUPPLIER_APPLY_CREDIT,
};

export default SupplierMutations;
