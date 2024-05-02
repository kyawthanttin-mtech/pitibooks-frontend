import { gql } from "@apollo/client";

const CREATE_SUPPLIER = gql`
  mutation CreateSupplier($input: NewSupplier!) {
    createSupplier(input: $input) {
      id
      businessId
      name
      email
      phone
      mobile
      supplierTax {
        id
        name
        rate
        type
        isActive
      }
      supplierPaymentTerms
      supplierPaymentTermsCustomDays
      notes
      prepaidCreditAmount
      unusedCreditAmount
      exchangeRate
      openingBalanceBranchId
      openingBalance
      isActive
      currency {
        id
        businessId
        symbol
        name
        decimalPlaces
        isActive
      }
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
      businessId
      name
      email
      phone
      mobile
      supplierTax {
        id
        name
        rate
        type
        isActive
      }
      supplierPaymentTerms
      supplierPaymentTermsCustomDays
      notes
      prepaidCreditAmount
      unusedCreditAmount
      exchangeRate
      openingBalanceBranchId
      openingBalance
      isActive
      currency {
        id
        businessId
        symbol
        name
        decimalPlaces
        isActive
      }
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
      businessId
      name
      email
      phone
      mobile
      supplierTax {
        id
        name
        rate
        type
        isActive
      }
      supplierPaymentTerms
      supplierPaymentTermsCustomDays
      notes
      prepaidCreditAmount
      unusedCreditAmount
      exchangeRate
      openingBalanceBranchId
      openingBalance
      isActive
      currency {
        id
        businessId
        symbol
        name
        decimalPlaces
        isActive
      }
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
      businessId
      name
      email
      phone
      mobile
      supplierTax {
        id
        name
        rate
        type
        isActive
      }
      supplierPaymentTerms
      supplierPaymentTermsCustomDays
      notes
      prepaidCreditAmount
      unusedCreditAmount
      exchangeRate
      openingBalanceBranchId
      openingBalance
      isActive
      currency {
        id
        businessId
        symbol
        name
        decimalPlaces
        isActive
      }
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

const SupplierMutations = {
  CREATE_SUPPLIER,
  UPDATE_SUPPLIER,
  DELETE_SUPPLIER,
  TOGGLE_ACTIVE_SUPPLIER,
};

export default SupplierMutations;
