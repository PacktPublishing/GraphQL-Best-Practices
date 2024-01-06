```graphql
"""
A book in the library.
"""
type Book {
  """
  The unique identifier for the book.
  """
  id: ID!

  """
  The title of the book.
  """
  title: String!

  """
  The author of the book.
  """
  author: String!

  """
  The genre of the book.
  """
  genre: String!

  """
  The publication year of the book.
  """
  publicationYear: Int!

  """
  Indicates if the book is currently available.
  """
  isAvailable: Boolean!

  """
  The name of the person who borrowed the book (if any).
  """
  borrower: String

  """
  The due date for returning the book (if applicable).
  """
  dueDate: String
}
```