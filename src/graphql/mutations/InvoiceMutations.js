import { gql } from "@apollo/client";

const CREATE_INVOICE = gql`
  mutation CreateSalesInvoice($input: NewSalesInvoice!) {
    createSalesInvoice(input: $input) {
      id
      businessId
      salesOrderId
      invoiceNumber
      referenceNumber
      invoiceDate
      invoiceDueDate
      invoicePaymentTerms
      invoiceSubject
      notes
      termsAndConditions
      invoiceDiscount
      invoiceDiscountType
      invoiceDiscountAmount
      shippingCharges
      adjustmentAmount
      isTaxInclusive
      invoiceTaxAmount
      currentStatus
      invoiceSubtotal
      invoiceTotalDiscountAmount
      invoiceTotalTaxAmount
      invoiceTotalAmount
      createdAt
      updatedAt
      customer {
        id
        name
        isActive
        createdAt
        updatedAt
      }
      branch {
        id
        name
      }
      salesPerson {
        id
        name
      }
      currency {
        id
        name
      }
      warehouse {
        id
        name
      }
    }
  }
`;

const UPDATE_INVOICE = gql`
  mutation UpdateSalesInvoice($input: NewSalesInvoice!, $id: ID!) {
    updateSalesInvoice(id: $id, input: $input) {
      id
      businessId
      salesOrderId
      invoiceNumber
      referenceNumber
      invoiceDate
      invoiceDueDate
      invoicePaymentTerms
      invoiceSubject
      notes
      termsAndConditions
      invoiceDiscount
      invoiceDiscountType
      invoiceDiscountAmount
      shippingCharges
      adjustmentAmount
      isTaxInclusive
      invoiceTaxAmount
      currentStatus
      invoiceSubtotal
      invoiceTotalDiscountAmount
      invoiceTotalTaxAmount
      invoiceTotalAmount
      createdAt
      updatedAt
      customer {
        id
        name
        isActive
        createdAt
        updatedAt
      }
      branch {
        id
        name
      }
      salesPerson {
        id
        name
      }
      currency {
        id
        name
      }
      warehouse {
        id
        name
      }
    }
  }
`;
const DELETE_INVOICE = gql`
  mutation DeleteSalesInvoice($id: ID!) {
    deleteSalesInvoice(id: $id) {
      id
      businessId
      salesOrderId
      invoiceNumber
      referenceNumber
      invoiceDate
      invoiceDueDate
      invoicePaymentTerms
      invoiceSubject
      notes
      termsAndConditions
      invoiceDiscount
      invoiceDiscountType
      invoiceDiscountAmount
      shippingCharges
      adjustmentAmount
      isTaxInclusive
      invoiceTaxAmount
      currentStatus
      invoiceSubtotal
      invoiceTotalDiscountAmount
      invoiceTotalTaxAmount
      invoiceTotalAmount
      createdAt
      updatedAt
      customer {
        id
        name
        isActive
        createdAt
        updatedAt
      }
      branch {
        id
        name
      }
      salesPerson {
        id
        name
      }
      currency {
        id
        name
      }
      warehouse {
        id
        name
      }
    }
  }
`;

const CONFIRM_INVOICE = gql`
  mutation ConfirmSalesInvoice($id: ID!) {
    confirmSalesInvoice(id: $id) {
      id
      businessId
      salesOrderId
      orderNumber
      invoiceNumber
      referenceNumber
      invoiceDate
      invoiceDueDate
      invoicePaymentTerms
      invoiceSubject
      notes
      termsAndConditions
      exchangeRate
      invoiceDiscount
      invoiceDiscountType
      invoiceDiscountAmount
      shippingCharges
      adjustmentAmount
      isTaxInclusive
      invoiceTaxAmount
      currentStatus
      invoiceSubtotal
      invoiceTotalDiscountAmount
      invoiceTotalTaxAmount
      invoiceTotalAmount
      invoiceTotalPaidAmount
      createdAt
      updatedAt
    }
  }
`;

const VOID_INVOICE = gql`
  mutation VoidSalesInvoice($id: ID!) {
    voidSalesInvoice(id: $id) {
      id
      businessId
      salesOrderId
      orderNumber
      invoiceNumber
      referenceNumber
      invoiceDate
      invoiceDueDate
      invoicePaymentTerms
      invoiceSubject
      notes
      termsAndConditions
      exchangeRate
      invoiceDiscount
      invoiceDiscountType
      invoiceDiscountAmount
      shippingCharges
      adjustmentAmount
      isTaxInclusive
      invoiceTaxAmount
      currentStatus
      invoiceSubtotal
      invoiceTotalDiscountAmount
      invoiceTotalTaxAmount
      invoiceTotalAmount
      invoiceTotalPaidAmount
      createdAt
      updatedAt
    }
  }
`;

const InvoiceMutations = {
  CREATE_INVOICE,
  UPDATE_INVOICE,
  DELETE_INVOICE,
  CONFIRM_INVOICE,
  VOID_INVOICE,
};

export default InvoiceMutations;
