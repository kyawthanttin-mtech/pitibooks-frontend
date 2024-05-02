import { gql } from "@apollo/client";

const GET_ALL_PAYMENT_MODES = gql`
  query ListAllPaymentMode {
    listAllPaymentMode {
      id
      name
      isActive
    }
  }
`;

const PaymentModeQueries = {
  GET_ALL_PAYMENT_MODES,
};

export default PaymentModeQueries;
