import { gql } from "@apollo/client";

const GET_PAGINATE_SUPPLIER_PAYMENT = gql`
  query PaginateSupplierPayment(
    $limit: Int
    $after: String
    $startPaymentDate: Time
    $endPaymentDate: Time
    $withdrawAccountId: Int
    $supplierId: Int
    $branchId: Int
    $referenceNumber: String
    $paymentNumber: String
  ) {
    paginateSupplierPayment(
      limit: $limit
      after: $after
      startPaymentDate: $startPaymentDate
      endPaymentDate: $endPaymentDate
      withdrawAccountId: $withdrawAccountId
      supplierId: $supplierId
      branchId: $branchId
      referenceNumber: $referenceNumber
      paymentNumber: $paymentNumber
    ) {
      edges {
        cursor
        node {
          id
          supplier {
            id
            name
            unusedCreditAmount
            paidBills {
              id
              businessId
              purchaseOrderNumber
              billNumber
              referenceNumber
              billDate
              billDueDate
              billPaymentTerms
              billPaymentTermsCustomDays
              billSubject
              notes
              exchangeRate
              billDiscount
              billDiscountType
              billDiscountAmount
              adjustmentAmount
              isTaxInclusive
              billTaxAmount
              currentStatus
              billSubtotal
              billTotalDiscountAmount
              billTotalTaxAmount
              billTotalAmount
              billTotalPaidAmount
              balanceDue
              createdAt
              updatedAt
              branch {
                id
                name
              }
              currency {
                id
                decimalPlaces
                exchangeRate
                name
                symbol
              }
            }
            unpaidBills {
              id
              businessId
              purchaseOrderNumber
              billNumber
              referenceNumber
              billDate
              billDueDate
              billPaymentTerms
              billPaymentTermsCustomDays
              billSubject
              notes
              exchangeRate
              billDiscount
              billDiscountType
              billDiscountAmount
              adjustmentAmount
              isTaxInclusive
              billTaxAmount
              currentStatus
              billSubtotal
              billTotalDiscountAmount
              billTotalTaxAmount
              billTotalAmount
              billTotalPaidAmount
              balanceDue
              createdAt
              updatedAt
              branch {
                id
                name
              }
              currency {
                id
                decimalPlaces
                exchangeRate
                name
                symbol
              }
            }
          }
          branch {
            id
            name
          }
          currency {
            id
            name
            symbol
            decimalPlaces
          }
          amount
          bankCharges
          paymentDate
          paymentNumber
          paymentMode {
            id
            name
          }
          withdrawAccount {
            id
            name
          }
          referenceNumber
          notes
          documents {
            id
            documentUrl
            referenceType
            referenceID
          }
          paidBills {
            id
            supplierPaymentId
            bill {
              id
              businessId
              purchaseOrderNumber
              billNumber
              referenceNumber
              billDate
              billDueDate
              billPaymentTerms
              billPaymentTermsCustomDays
              billSubject
              notes
              exchangeRate
              billDiscount
              billDiscountType
              billDiscountAmount
              adjustmentAmount
              isTaxInclusive
              billTaxAmount
              currentStatus
              billSubtotal
              billTotalDiscountAmount
              billTotalTaxAmount
              billTotalAmount
              billTotalPaidAmount
              balanceDue
              branch {
                id
                name
              }
              currency {
                id
                decimalPlaces
                exchangeRate
                name
                symbol
              }
            }
            paidAmount
          }
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
    }
  }
`;

const SupplierPaymentQueries = {
  GET_PAGINATE_SUPPLIER_PAYMENT,
};

export default SupplierPaymentQueries;
