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
      remainingBalance
      invoiceTotalCreditUsedAmount
      invoiceTotalAdvanceUsedAmount
      invoiceTotalWriteOffAmount
      writeOffReason
      writeOffDate
      appliedCustomerCredits {
        id
        businessId
        referenceId
        referenceType
        customerCreditNumber
        branchId
        customerId
        invoiceId
        invoiceNumber
        creditDate
        amount
        exchangeRate
        createdAt
        updatedAt
        currency {
          id
          decimalPlaces
          name
          symbol
        }
      }
      salesPerson {
        id
        name
      }
      details {
        id
        productId
        productType
        batchNumber
        name
        description
        detailAccount {
          id
          name
        }
        detailQty
        detailUnitRate
        detailTax {
          id
          name
          rate
          type
        }
        detailDiscount
        detailDiscountType
        detailDiscountAmount
        detailTaxAmount
        detailTotalAmount
      }
      warehouse {
        id
        name
      }
      customer {
        id
        name
        openingBalance
        openingBalanceBranchId
      }
      branch {
        id
        name
      }
      currency {
        id
        symbol
        name
        decimalPlaces
      }
      salesOrder {
        id
        orderNumber
        orderDate
        currentStatus
      }
      invoicePayment {
        paymentDate
        paymentNumber
        referenceNumber
        amount
        paymentMode
      }
      createdAt
      updatedAt
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
      remainingBalance
      invoiceTotalCreditUsedAmount
      invoiceTotalAdvanceUsedAmount
      invoiceTotalWriteOffAmount
      writeOffReason
      writeOffDate
      appliedCustomerCredits {
        id
        businessId
        referenceId
        referenceType
        customerCreditNumber
        branchId
        customerId
        invoiceId
        invoiceNumber
        creditDate
        amount
        exchangeRate
        createdAt
        updatedAt
        currency {
          id
          decimalPlaces
          name
          symbol
        }
      }
      salesPerson {
        id
        name
      }
      details {
        id
        productId
        productType
        batchNumber
        name
        description
        detailAccount {
          id
          name
        }
        detailQty
        detailUnitRate
        detailTax {
          id
          name
          rate
          type
        }
        detailDiscount
        detailDiscountType
        detailDiscountAmount
        detailTaxAmount
        detailTotalAmount
      }
      warehouse {
        id
        name
      }
      customer {
        id
        name
        openingBalance
        openingBalanceBranchId
      }
      branch {
        id
        name
      }
      currency {
        id
        symbol
        name
        decimalPlaces
      }
      salesOrder {
        id
        orderNumber
        orderDate
        currentStatus
      }
      invoicePayment {
        paymentDate
        paymentNumber
        referenceNumber
        amount
        paymentMode
      }
      createdAt
      updatedAt
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
      remainingBalance
      invoiceTotalCreditUsedAmount
      invoiceTotalAdvanceUsedAmount
      invoiceTotalWriteOffAmount
      writeOffReason
      writeOffDate
      appliedCustomerCredits {
        id
        businessId
        referenceId
        referenceType
        customerCreditNumber
        branchId
        customerId
        invoiceId
        invoiceNumber
        creditDate
        amount
        exchangeRate
        createdAt
        updatedAt
        currency {
          id
          decimalPlaces
          name
          symbol
        }
      }
      salesPerson {
        id
        name
      }
      details {
        id
        productId
        productType
        batchNumber
        name
        description
        detailAccount {
          id
          name
        }
        detailQty
        detailUnitRate
        detailTax {
          id
          name
          rate
          type
        }
        detailDiscount
        detailDiscountType
        detailDiscountAmount
        detailTaxAmount
        detailTotalAmount
      }
      warehouse {
        id
        name
      }
      customer {
        id
        name
        openingBalance
        openingBalanceBranchId
      }
      branch {
        id
        name
      }
      currency {
        id
        symbol
        name
        decimalPlaces
      }
      salesOrder {
        id
        orderNumber
        orderDate
        currentStatus
      }
      invoicePayment {
        paymentDate
        paymentNumber
        referenceNumber
        amount
        paymentMode
      }
      createdAt
      updatedAt
    }
  }
`;

const CONFIRM_INVOICE = gql`
  mutation ConfirmSalesInvoice($id: ID!) {
    confirmSalesInvoice(id: $id) {
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
      remainingBalance
      invoiceTotalCreditUsedAmount
      invoiceTotalAdvanceUsedAmount
      invoiceTotalWriteOffAmount
      writeOffReason
      writeOffDate
      appliedCustomerCredits {
        id
        businessId
        referenceId
        referenceType
        customerCreditNumber
        branchId
        customerId
        invoiceId
        invoiceNumber
        creditDate
        amount
        exchangeRate
        createdAt
        updatedAt
        currency {
          id
          decimalPlaces
          name
          symbol
        }
      }
      salesPerson {
        id
        name
      }
      details {
        id
        productId
        productType
        batchNumber
        name
        description
        detailAccount {
          id
          name
        }
        detailQty
        detailUnitRate
        detailTax {
          id
          name
          rate
          type
        }
        detailDiscount
        detailDiscountType
        detailDiscountAmount
        detailTaxAmount
        detailTotalAmount
      }
      warehouse {
        id
        name
      }
      customer {
        id
        name
        openingBalance
        openingBalanceBranchId
      }
      branch {
        id
        name
      }
      currency {
        id
        symbol
        name
        decimalPlaces
      }
      salesOrder {
        id
        orderNumber
        orderDate
        currentStatus
      }
      invoicePayment {
        paymentDate
        paymentNumber
        referenceNumber
        amount
        paymentMode
      }
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
      remainingBalance
      invoiceTotalCreditUsedAmount
      invoiceTotalAdvanceUsedAmount
      invoiceTotalWriteOffAmount
      writeOffReason
      writeOffDate
      appliedCustomerCredits {
        id
        businessId
        referenceId
        referenceType
        customerCreditNumber
        branchId
        customerId
        invoiceId
        invoiceNumber
        creditDate
        amount
        exchangeRate
        createdAt
        updatedAt
        currency {
          id
          decimalPlaces
          name
          symbol
        }
      }
      salesPerson {
        id
        name
      }
      details {
        id
        productId
        productType
        batchNumber
        name
        description
        detailAccount {
          id
          name
        }
        detailQty
        detailUnitRate
        detailTax {
          id
          name
          rate
          type
        }
        detailDiscount
        detailDiscountType
        detailDiscountAmount
        detailTaxAmount
        detailTotalAmount
      }
      warehouse {
        id
        name
      }
      customer {
        id
        name
        openingBalance
        openingBalanceBranchId
      }
      branch {
        id
        name
      }
      currency {
        id
        symbol
        name
        decimalPlaces
      }
      salesOrder {
        id
        orderNumber
        orderDate
        currentStatus
      }
      invoicePayment {
        paymentDate
        paymentNumber
        referenceNumber
        amount
        paymentMode
      }
      createdAt
      updatedAt
    }
  }
`;

const WRITE_OFF_INVOICE = gql`
  mutation WriteOffSalesInvoice($id: ID!, $date: Time!, $reason: String!) {
    writeOffSalesInvoice(id: $id, date: $date, reason: $reason) {
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
      remainingBalance
      invoiceTotalCreditUsedAmount
      invoiceTotalAdvanceUsedAmount
      invoiceTotalWriteOffAmount
      writeOffReason
      writeOffDate
      appliedCustomerCredits {
        id
        businessId
        referenceId
        referenceType
        customerCreditNumber
        branchId
        customerId
        invoiceId
        invoiceNumber
        creditDate
        amount
        exchangeRate
        createdAt
        updatedAt
        currency {
          id
          decimalPlaces
          name
          symbol
        }
      }
      salesPerson {
        id
        name
      }
      details {
        id
        productId
        productType
        batchNumber
        name
        description
        detailAccount {
          id
          name
        }
        detailQty
        detailUnitRate
        detailTax {
          id
          name
          rate
          type
        }
        detailDiscount
        detailDiscountType
        detailDiscountAmount
        detailTaxAmount
        detailTotalAmount
      }
      warehouse {
        id
        name
      }
      customer {
        id
        name
        openingBalance
        openingBalanceBranchId
      }
      branch {
        id
        name
      }
      currency {
        id
        symbol
        name
        decimalPlaces
      }
      salesOrder {
        id
        orderNumber
        orderDate
        currentStatus
      }
      invoicePayment {
        paymentDate
        paymentNumber
        referenceNumber
        amount
        paymentMode
      }
      createdAt
      updatedAt
    }
  }
`;

const CANCEL_WRITE_OFF_INVOICE = gql`
  mutation CancelWriteOffSalesInvoice($id: ID!) {
    cancelWriteOffSalesInvoice(id: $id) {
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
      remainingBalance
      invoiceTotalCreditUsedAmount
      invoiceTotalAdvanceUsedAmount
      invoiceTotalWriteOffAmount
      writeOffReason
      writeOffDate
      appliedCustomerCredits {
        id
        businessId
        referenceId
        referenceType
        customerCreditNumber
        branchId
        customerId
        invoiceId
        invoiceNumber
        creditDate
        amount
        exchangeRate
        createdAt
        updatedAt
        currency {
          id
          decimalPlaces
          name
          symbol
        }
      }
      salesPerson {
        id
        name
      }
      details {
        id
        productId
        productType
        batchNumber
        name
        description
        detailAccount {
          id
          name
        }
        detailQty
        detailUnitRate
        detailTax {
          id
          name
          rate
          type
        }
        detailDiscount
        detailDiscountType
        detailDiscountAmount
        detailTaxAmount
        detailTotalAmount
      }
      warehouse {
        id
        name
      }
      customer {
        id
        name
        openingBalance
        openingBalanceBranchId
      }
      branch {
        id
        name
      }
      currency {
        id
        symbol
        name
        decimalPlaces
      }
      salesOrder {
        id
        orderNumber
        orderDate
        currentStatus
      }
      invoicePayment {
        paymentDate
        paymentNumber
        referenceNumber
        amount
        paymentMode
      }
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
  WRITE_OFF_INVOICE,
  CANCEL_WRITE_OFF_INVOICE,
};

export default InvoiceMutations;
