import { gql } from '@apollo/client';

const GET_CATEGORIES = gql`
    query GetCategories($name: String) {
        categories(name: $name) {
            id
            name
            parentCategory {
                id
                name
            }
        }
    }
`

const GET_CATEGORY_NAMES = gql`
    query GetCategories($name: String) {
        categories(name: $name) {
            id
            name
            parentCategory {
                id
                name
            }
        }
    }
`

const CategoryQueries = {
    GET_CATEGORIES, GET_CATEGORY_NAMES
}

export default CategoryQueries;