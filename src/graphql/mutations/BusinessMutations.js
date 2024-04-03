import { gql } from "@apollo/client";

const UPDATE_BUSINESS = gql`
  mutation UpdateBusiness($input: NewBusiness!) {
    updateBusiness(input: $input) {
      id
      name
    }
  }
`;

const BusinessMutations = {
  UPDATE_BUSINESS,
};

export default BusinessMutations;
