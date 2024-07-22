import { gql } from "@apollo/client";

const CREATE_PRODUCT_GROUP = gql`
  mutation CreateProductGroup($input: NewProductGroup!) {
    createProductGroup(input: $input) {
      id
      businessId
      name
      description
      isActive
      createdAt
      updatedAt
      variants {
        ID

        name
        sku
        barcode
        salesPrice
        isSalesTaxInclusive
        purchasePrice
        isActive
        createdAt
        updatedAt
      }
      # modifiers {
      #     id
      #     businessId
      #     name
      #     isActive
      #     createdAt
      #     updatedAt
      # }
    }
  }
`;

const UPDATE_PRODUCT_GROUP = gql`
  mutation UpdatePG($id: ID!, $input: NewProductGroup!) {
    updateProductGroup(id: $id, input: $input) {
      id
      businessId
      name
      description
      # isActive
      createdAt
      updatedAt
    }
  }
`;
const DELETE_PRODUCT_GROUP = gql`
  mutation DeleteProductGroup($id: ID!) {
    deleteProductGroup(id: $id) {
      id
      businessId
      name
      description
      isActive
      createdAt
      updatedAt
      variants {
        ID
        productGroupId
        name
        sku
        barcode
        salesPrice
        isSalesTaxInclusive
        purchasePrice
        isActive
        createdAt
        updatedAt
      }
      modifiers {
        id
        businessId
        name
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

const ProductGroupMutations = {
  CREATE_PRODUCT_GROUP,
  UPDATE_PRODUCT_GROUP,
  DELETE_PRODUCT_GROUP,
};

export default ProductGroupMutations;
