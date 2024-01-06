```graphql
type Book {
  id: ID!
  title: String!
  author: String!
  genre: String!
  publicationYear: Int!
  isAvailable: Boolean!
  borrower: String
  dueDate: String
}
```