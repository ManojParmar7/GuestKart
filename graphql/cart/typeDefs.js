const gql = String.raw;

module.exports = gql`
  type ExtraOption {
    id: ID
    name: String
    price: Float
  }

  type ColorOption {
    id: ID
    name: String
    price: Float
  }
  type SizeOption {
    id: ID
    name: String
    price: Float
  }
  type SelectedOptions {
    color: ColorOption
    size: SizeOption
    extras: [ExtraOption]
  }

  type CartItem {
    product: Product
    quantity: Int
    selectedOptions: SelectedOptions
  }

  type Cart {
    id: ID!
    user: User
    sessionId: String
    items: [CartItem]
  }

  type CartResponse {
    success: Boolean!
    message: String!
    cart: Cart
  }

  extend type Query {
    getCartBySession(sessionId: String, subadminId: ID): [Cart]
  }

  input ExtraOptionInput {
    _id: ID
    name: String
    price: Float
  }

  input ColorOptionInput {
    _id: ID
    name: String
    price: Float
  }
  input SizeOptionInput {
    _id: ID
    name: String
    price: Float
  }

  input SelectedOptionsInput {
    color: ColorOptionInput
    size: SizeOptionInput
    extras: [ExtraOptionInput]
  }
  extend type Mutation {
    addToCart(
      subadminId: ID!
      sessionId: String!
      productId: ID!
      quantity: Int
      selectedOptions: SelectedOptionsInput
    ): CartResponse

    removeFromCart(sessionId: String!, productId: ID!): CartResponse
    clearCart(sessionId: String!): CartResponse
  }
`;
