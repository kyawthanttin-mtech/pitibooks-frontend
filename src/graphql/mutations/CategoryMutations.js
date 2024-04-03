import { gql } from '@apollo/client';

const CREATE_CATEGORY = gql`
    mutation CreateCategory($input: NewCategory!){
        createCategory(input: $input) {
            id
            name
            parentCategory {
                id
                name
            }
        }
    }
`

const UPDATE_CATEGORY = gql`
    mutation UpdateCategory($id: ID!, $input: NewCategory!){
        updateCategory(id: $id, input: $input) {
            id
            name
            parentCategory {
                id
                name
            }
        }
    }
`

const DELETE_CATEGORY = gql`
    mutation DeleteCategory($id: ID!){
        deleteCategory(id: $id) {
            id
            name
            parentCategory {
                id
                name
            }
        }
    }
`

const CategoryMutations = {
    CREATE_CATEGORY,
    UPDATE_CATEGORY,
    DELETE_CATEGORY
}

export default CategoryMutations;