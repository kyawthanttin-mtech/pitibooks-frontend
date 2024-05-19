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

const InvoiceMutations = {
  CREATE_INVOICE,
  UPDATE_INVOICE,
  DELETE_INVOICE,
};

export default InvoiceMutations;
