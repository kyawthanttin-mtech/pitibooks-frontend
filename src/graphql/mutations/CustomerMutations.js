import { gql } from "@apollo/client";

const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($input: NewCustomer!) {
    createCustomer(input: $input) {
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
      customerTax {
        id
        name
        rate
        type
        isActive
      }
      openingBalanceBranchId
      openingBalance
      exchangeRate
      customerPaymentTerms
      customerPaymentTermsCustomDays
      notes
      creditLimit
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
      customerTax {
        id
        name
        rate
        type
        isActive
      }
      openingBalanceBranchId
      openingBalance
      exchangeRate
      customerPaymentTerms
      customerPaymentTermsCustomDays
      notes
      creditLimit
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
      customerTax {
        id
        name
        rate
        type
        isActive
      }
      openingBalanceBranchId
      openingBalance
      exchangeRate
      customerPaymentTerms
      customerPaymentTermsCustomDays
      notes
      creditLimit
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

const TOGGLE_ACTIVE_CUSTOMER = gql`
  mutation ToggleActiveCustomer($id: ID!, $isActive: Boolean!) {
    toggleActiveCustomer(id: $id, isActive: $isActive) {
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
      customerTax {
        id
        name
        rate
        type
        isActive
      }
      openingBalanceBranchId
      openingBalance
      exchangeRate
      customerPaymentTerms
      customerPaymentTermsCustomDays
      notes
      creditLimit
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

const CustomerMutations = {
  CREATE_CUSTOMER,
  UPDATE_CUSTOMER,
  DELETE_CUSTOMER,
  TOGGLE_ACTIVE_CUSTOMER,
};

export default CustomerMutations;
