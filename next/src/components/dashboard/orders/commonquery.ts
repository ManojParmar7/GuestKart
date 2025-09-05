/* eslint-disable unicorn/template-indent */

import { gql } from "@apollo/client";

export const getAllOrders = gql`

query GetAllOrders($page: Int, $limit: Int, $search: String, $subadminId: ID, $superadminId: ID, $sessionId: ID) {
  getAllOrders(page: $page, limit: $limit, search: $search, subadminId: $subadminId, superadminId: $superadminId, sessionId: $sessionId) {
    data {
      items {
        product {
          id
          price
          
          images
         
          sizes {
            id
            name
          }
          colors {
            id
            name
          }
          extras {
            id
            name
          }
          discountPrice
          stock
          name
        }
        quantity
        price
        discount
        discountType
        totalOptionPrice
        selectedOptions {
          color {
            _id
            name
            price
          }
          size {
            _id
            name
            price
          }
          extras {
            _id
            name
            price
          }
        }
      }

      totalAmount
      discountAmount
      finalAmount
      paymentStatus
      paymentMethod
      orderStatus
      contactInfo {
        name
        email
        phone
        address
      }
      deliveryCharge
      deliveryStatus
      deliveryBoy {
        id
        name
        image
        email
        phone
        website
      }
      id
      subadminId
      superadminId
    }
    total
    page
    limit
    totalPages
  }
}
`;

export const assignDeliveryBoy = gql`
mutation AssignOrderToDeliveryBoy($orderId: ID!, $deliveryBoyId: ID!) {
  assignOrderToDeliveryBoy(orderId: $orderId, deliveryBoyId: $deliveryBoyId) {
    success
    message
    order {
      id
      sessionId
      subadminId
      superadminId
      user {
        id
        name
        username
        email
      }
    }
    clientSecret
  }
}
`;


export const acceptOrder = gql`
mutation AcceptOrder($orderId: ID!, $subadminId: ID, $superadminId: ID) {
  acceptOrder(orderId: $orderId, subadminId: $subadminId, superadminId: $superadminId) {
    success
    message
    order {
      orderStatus
    }
    clientSecret
  }
}
`;


export const cancelOrder = gql`
mutation CancelOrder($orderId: ID!, $subadminId: ID, $superadminId: ID) {
  cancelOrder(orderId: $orderId, subadminId: $subadminId, superadminId: $superadminId) {
    success
    message
    order {
      id
      
    }
    clientSecret
  }
}
`;

export const deleteOrder = gql`
mutation DeleteOrder($orderId: ID!) {
  deleteOrder(orderId: $orderId) {
    success
    message
    order {
      id
      sessionId
    }
    clientSecret
  }
}
`;