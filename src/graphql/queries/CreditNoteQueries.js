import { gql } from "@apollo/client";

const GET_PAGINATE_CREDIT_NOTE = gql`
  query GetPaginateCreditNote {
    paginateCreditNote {
      edges {
        cursor
        node {
          id
          customer {
            id
            name
          }
          branch {
            id
            name
          }
          creditNoteNumber
          referenceNumber

          creditNoteDate
          creditNoteSubject
          salesPerson {
            id
            name
          }
          termsAndConditions
          notes
          currency {
            id
            decimalPlaces
            symbol
          }
          warehouse {
            id
            name
          }
          creditNoteDiscount
          creditNoteDiscountType
          creditNoteDiscountAmount
          shippingCharges
          adjustmentAmount
          isTaxInclusive
          creditNoteTax {
            id
            name
            rate
            type
          }
          creditNoteTaxAmount
          currentStatus
          creditNoteSubtotal
          creditNoteTotalDiscountAmount
          creditNoteTotalTaxAmount
          creditNoteTotalAmount
          details {
            id
            creditNoteId
            productId
            productType
            name
            description
            detailAccount {
              id
              name
            }
            detailQty
            detailUnitRate
            detailDiscount
            detailDiscountType
            detailTax {
              id
              name
              rate
              type
            }
            detailDiscountAmount
            detailTaxAmount
            detailTotalAmount
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

const CreditNoteQueries = {
  GET_PAGINATE_CREDIT_NOTE,
};

export default CreditNoteQueries;
