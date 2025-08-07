// eslint-disable-next-line unicorn/template-indent

import { gql } from "@apollo/client";

export const GetUsersBySuperadmin = gql`
	query GetUsersBySuperadmin($superadminId: ID!, $filters: UserFilterInput, $limit: Int, $page: Int) {
		getUsersBySuperadmin(superadmin_id: $superadminId, filters: $filters, limit: $limit, page: $page) {
			success
			message
			users {
				id
				name
				username
				email
				phone
				website
				password
				role {
					id
					name
				}
				image
				createdBy
				superadmin_id
				country
				currency
				createdAt
				updatedAt
				token
			}
			total
			page
			limit
		}
	}
`;
export const GetPermissions = gql`
	query GetPermission($superadminId: ID!, $subadminId: ID!) {
		getPermission(superadminId: $superadminId, subadminId: $subadminId) {
			id
			subadmin_id
			superadmin_id
			modules {
				products {
					view
					create
					update
					delete
				}
				categories {
					view
					create
					update
					delete
				}
				orders {
					view
					update
				}
				banners {
					view
					create
					update
					delete
				}
			}
		}
	}
`;

export const creaOrUpdatePermission = gql`
	mutation CreateOrUpdatePermissions($subadminId: ID!, $superadminId: ID!, $modules: JSON!) {
		createOrUpdatePermissions(subadmin_id: $subadminId, superadmin_id: $superadminId, modules: $modules) {
			modules {
				products {
					view
					create
					update
					delete
				}
				categories {
					view
					create
					update
					delete
				}
				orders {
					view
					update
				}
				banners {
					view
					create
					update
					delete
				}
			}
			id
			subadmin_id
			superadmin_id
		}
	}
`;

export const createSubadmin = gql`
	mutation CreateUser(
		$name: String!
		$username: String!
		$email: String!
		$phone: String!
		$website: String!
		$password: String!
		$role: ID!
		$superadminId: ID
		$image: Upload!
		$createdBy: ID
	) {
		createUser(
			name: $name
			username: $username
			email: $email
			phone: $phone
			website: $website
			password: $password
			role: $role
			superadmin_id: $superadminId
			image: $image
			createdBy: $createdBy
		) {
			success
			message
			users {
				id
				name
				username
				email
				phone
				website
				password
				image
				role {
					id
					name
				}
				superadmin_id
			}
		}
	}
`;
export const deleteUser = gql`
	mutation DeleteUser($deleteUserId: ID!) {
		deleteUser(id: $deleteUserId) {
			success
			message
			users {
				id
				name
				username
				email
				phone
				website
				createdAt
				updatedAt
			}
		}
	}
`;
export const updateUser = gql`
	mutation UpdateUser(
		$updateUserId: ID!
		$password: String
		$name: String
		$username: String
		$email: String
		$phone: String
		$website: String
		$country: String
		$currency: String
		$createdBy: ID
		$superadminId: ID
		$image: Upload
		$role: ID
	) {
		updateUser(
			id: $updateUserId
			password: $password
			name: $name
			username: $username
			email: $email
			phone: $phone
			website: $website
			country: $country
			currency: $currency
			createdBy: $createdBy
			superadmin_id: $superadminId
			image: $image
			role: $role
		) {
			success
			message
			users {
				id
				name
				username
				email
				phone
				website
				password
				createdBy
				superadmin_id
				country
				currency
				createdAt
				updatedAt
				token
				image
				role {
					id
					name
				}
			}
		}
	}
`;
export const getUserById = gql`
	query GetUser($getUserId: ID!) {
		getUser(id: $getUserId) {
			id
			name
			username
			email
			phone
			website
			password
			role {
				id
				name
			}
			createdBy
			superadmin_id
			country
			currency
			createdAt
			updatedAt
			token
			image
		}
	}
`;

export const getAllBanner = gql`
	query GetAllBanners($page: Int, $limit: Int, $search: String, $subadminId: ID, $superadminId: ID) {
		getAllBanners(page: $page, limit: $limit, search: $search, subadminId: $subadminId, superadminId: $superadminId) {
			success
			message
			total
			currentPage
			totalPages
			banners {
				id
				title
				subTitle
				description
				image
				user {
					id
					name
					username
					email
					phone
					website
					password
					createdBy
					superadmin_id
					country
					currency
					createdAt
					updatedAt
					image
					token
				}
			}
		}
	}
`;
