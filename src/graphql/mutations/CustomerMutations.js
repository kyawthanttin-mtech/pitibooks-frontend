import { gql } from "@apollo/client";

const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($input: NewCustomer!) {
    createCustomer(input: $input) {
      id
      businessId
      name
      email
      phone
      mobile
      customerTax {
        id
        name
        rate
        type
        isActive
      }
      customerPaymentTerms
      customerPaymentTermsCustomDays
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

const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: ID!, $input: NewCustomer!) {
    updateCustomer(id: $id, input: $input) {
      id
      businessId
      name
      email
      phone
      mobile
      customerTax {
        id
        name
        rate
        type
        isActive
      }
      customerPaymentTerms
      customerPaymentTermsCustomDays
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
const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id) {
      id
      businessId
      name
      email
      phone
      mobile
      customerTax {
        id
        name
        rate
        type
        isActive
      }
      customerPaymentTerms
      customerPaymentTermsCustomDays
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

const TOGGLE_ACTIVE_PRODUCT_UNIT = gql`
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

const CustomerMutations = {
  CREATE_CUSTOMER,
  UPDATE_CUSTOMER,
  DELETE_CUSTOMER,
  TOGGLE_ACTIVE_PRODUCT_UNIT,
};

export default CustomerMutations;
