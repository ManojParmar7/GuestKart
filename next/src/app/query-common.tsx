/*eslint-disable */
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
export const deleteBanner = gql`
	mutation DeleteBanner($deleteBannerId: ID!) {
		deleteBanner(id: $deleteBannerId) {
			success
			message
			banner {
				id
				title
				subTitle
				description
				image
				user {
					id
					name
				}
			}
		}
	}
`;

export const getByIdBanner = gql`
	query GetBanner($getBannerId: ID!) {
		getBanner(id: $getBannerId) {
			id
			title
			subTitle
			description
			image
			subadminId
			superadminId
			user {
				id
				name
			}
		}
	}
`;

export const updateBanner = gql`
	mutation UpdateBanner(
		$image: Upload
		$subadminId: ID
		$superadminId: ID!
		$title: String
		$subTitle: String
		$description: String
		$updateBannerId: ID!
	) {
		updateBanner(
			image: $image
			subadminId: $subadminId
			superadminId: $superadminId
			title: $title
			subTitle: $subTitle
			description: $description
			id: $updateBannerId
		) {
			success
			message
			banner {
				id
				title
				subTitle
				description
				image
				user {
					id
					name
				}
			}
		}
	}
`;
export const createBanner = gql`
	mutation CreateBanner(
		$title: String!
		$subadminId: ID!
		$superadminId: ID!
		$image: Upload!
		$subTitle: String
		$description: String
	) {
		createBanner(
			title: $title
			subadminId: $subadminId
			superadminId: $superadminId
			image: $image
			subTitle: $subTitle
			description: $description
		) {
			success
			message
			banner {
				id
				title
				subTitle
				description
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
				image
			}
		}
	}
`;

export const GetCategotyById = gql`
	query GetCategory($getCategoryId: ID!) {
		getCategory(id: $getCategoryId) {
			id
			name
			slug
			description
			image
			subadminId
			superadminId
		}
	}
`;

export const GetAllCategories = gql`
	query GetAllCategories($subadminId: ID, $superadminId: ID, $search: String, $page: Int, $limit: Int) {
		getAllCategories(
			subadminId: $subadminId
			superadminId: $superadminId
			search: $search
			page: $page
			limit: $limit
		) {
			success
			message
			total
			currentPage
			totalPages
			categories {
				id
				name
				slug
				description
				image
				subadminId
				superadminId
			}
		}
	}
`;
export const UpdateCategory = gql`
	mutation UpdateCategory($updateCategoryId: ID!, $subadminId: ID, $superadminId: ID, $image: Upload) {
		updateCategory(id: $updateCategoryId, subadminId: $subadminId, superadminId: $superadminId, image: $image) {
			success
			message
			category {
				id
				name
				slug
				description
				image
				subadminId
				superadminId
			}
		}
	}
`;

export const createCategory = gql`
	mutation CreateCategory(
		$name: String!
		$slug: String!
		$image: Upload!
		$subadminId: ID!
		$superadminId: ID!
		$description: String
	) {
		createCategory(
			name: $name
			slug: $slug
			image: $image
			subadminId: $subadminId
			superadminId: $superadminId
			description: $description
		) {
			success
			message
			category {
				id
				name
				slug
				description
				image
				subadminId
				superadminId
			}
		}
	}
`;
export const deleteCategoryId = gql`
	mutation DeleteCategory($deleteCategoryId: ID!) {
		deleteCategory(id: $deleteCategoryId) {
			success
			message
			category {
				id
				name
				slug
				description
				image
				subadminId
				superadminId
			}
		}
	}
`;
export const createRole = gql`
	mutation CreateRole($name: String!, $description: String, $createdBy: ID) {
		createRole(name: $name, description: $description, createdBy: $createdBy) {
			success
			message
			role {
				id
				name
				description
				createdAt
				updatedAt
				createdBy
			}
		}
	}
`;
export const updateRole = gql`
	mutation UpdateRole($updateRoleId: ID!, $name: String, $description: String) {
		updateRole(id: $updateRoleId, name: $name, description: $description) {
			success
			message
			role {
				id
				name
				description
				createdAt
				updatedAt
				createdBy
			}
		}
	}
`;
export const getRole = gql`
	query GetRole($getRoleId: ID!) {
		getRole(id: $getRoleId) {
			id
			name
			description
			createdAt
			updatedAt
			createdBy
		}
	}
`;
export const getAllRoles = gql`
	query GetAllRoles($page: Int, $limit: Int, $search: String) {
		getAllRoles(page: $page, limit: $limit, search: $search) {
			success
			message
			total
			currentPage
			totalPages
			roles {
				id
				name
				description
				createdAt
				updatedAt
				createdBy
			}
		}
	}
`;
export const deleteRoles = gql`
	mutation DeleteRole($deleteRoleId: ID!) {
		deleteRole(id: $deleteRoleId) {
			success
			message
			role {
				id
				name
				description
				createdAt
				updatedAt
				createdBy
			}
		}
	}
`;
export const getAllProducts = gql`
	query GetAllProducts($page: Int, $limit: Int, $search: String, $subadminId: ID, $superadminId: ID, $categoryId: ID) {
		getAllProducts(
			page: $page
			limit: $limit
			search: $search
			subadminId: $subadminId
			superadminId: $superadminId
			categoryId: $categoryId
		) {
			success
			message
			total
			currentPage
			totalPages
			products {
				id
				name
				price
				description
				stock
				images
				category {
					id
					name
				}
				sizes {
					id
					name
				}
				user {
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
				subadminId
				superadminId
			}
		}
	}
`;
export const updateProduct = gql`
	mutation UpdateProduct(
		$updateProductId: ID!
		$subadminId: ID!
		$superadminId: ID!
		$name: String
		$price: Float
		$description: String
		$stock: Int
		$categoryId: ID
		$userId: ID
		$images: [Upload!]
		$sizes: [ID!]
		$colors: [ID!]
		$extras: [ID!]
	) {
		updateProduct(
			id: $updateProductId
			subadminId: $subadminId
			superadminId: $superadminId
			name: $name
			price: $price
			description: $description
			stock: $stock
			categoryId: $categoryId
			images: $images
			sizes: $sizes
			colors: $colors
			extras: $extras
		) {
			success
			message
			product {
				id
				name
				subadminId
				superadminId
			}
		}
	}
`;
export const createProduct = gql`
	mutation CreateProduct(
		$name: String!
		$price: Float!
		$stock: Int!
		$categoryId: ID!
		$subadminId: ID!
		$superadminId: ID!
		$images: [Upload!]!
		$sizes: [ID!]!
		$colors: [ID!]!
		$extras: [ID!]!
	) {
		createProduct(
			name: $name
			price: $price
			stock: $stock
			categoryId: $categoryId
			subadminId: $subadminId
			superadminId: $superadminId
			images: $images
			sizes: $sizes
			colors: $colors
			extras: $extras
		) {
			success
			message
			product {
				id
				name
				price
				description
				stock
				images
				category {
					id
					name
				}
				sizes {
					id
					name
				}
				user {
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
				subadminId
				superadminId
			}
		}
	}
`;

export const getProductById = gql`
	query GetProduct($getProductId: ID!) {
		getProduct(getProductId: $getProductId) {
			success
			message
			product {
				id
				name
				price
				description
				stock
				images
				category {
					id
					name
				}
				sizes {
					id
					name
				}
				user {
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
					price
				}
				subadminId
				superadminId
			}
		}
	}
`;

export const deleteProduct = gql`
	mutation DeleteProduct($deleteProductId: ID!) {
		deleteProduct(id: $deleteProductId) {
			success
			message
			product {
				id
				name
				price
				description
				stock
				images
				subadminId
				superadminId
			}
		}
	}
`;
export const createColor = gql`
	mutation CreateColor($name: String!, $price: Float!, $superadminId: ID, $subadminId: ID) {
		createColor(name: $name, price: $price, superadminId: $superadminId, subadminId: $subadminId) {
			success
			message
			color {
				id
				name
				price
				superadminId
				subadminId
			}
		}
	}
`;
export const updateColor = gql`
	mutation UpdateColor($updateColorId: ID!, $name: String, $price: Float, $superadminId: ID, $subadminId: ID) {
		updateColor(id: $updateColorId, name: $name, price: $price, superadminId: $superadminId, subadminId: $subadminId) {
			success
			message
			color {
				id
				name
				price
				superadminId
				subadminId
			}
		}
	}
`;
export const getColors = gql`
	query GetColors($search: String, $page: Int, $limit: Int, $superadminId: ID, $subadminId: ID) {
		getColors(search: $search, page: $page, limit: $limit, superadminId: $superadminId, subadminId: $subadminId) {
			colors {
				id
				name
				price
				superadminId
				subadminId
			}
			totalCount
			totalPages
			currentPage
		}
	}
`;
export const getColorsById = gql`
	query GetColor($getColorId: ID!) {
		getColor(id: $getColorId) {
			id
			name
			price
			superadminId
			subadminId
		}
	}
`;
export const deleteColor = gql`
	mutation DeleteColor($deleteColorId: ID!) {
		deleteColor(id: $deleteColorId) {
			success
			message
			color {
				id
				name
				price
				superadminId
				subadminId
			}
		}
	}
`;
export const createExtra = gql`
	mutation CreateExtra($name: String!, $price: Float!, $superadminId: ID!, $subadminId: ID) {
		createExtra(name: $name, price: $price, superadminId: $superadminId, subadminId: $subadminId) {
			success
			message
			extra {
				id
				name
				price
				superadminId
				subadminId
				createdAt
				updatedAt
			}
		}
	}
`;
export const updateExtra = gql`
	mutation UpdateExtra($updateExtraId: ID!, $name: String, $price: Float) {
		updateExtra(id: $updateExtraId, name: $name, price: $price) {
			success
			message
			extra {
				id
				name
				price
				superadminId
				subadminId
				createdAt
				updatedAt
			}
		}
	}
`;
export const getExtras = gql`
	query GetExtras($superadminId: ID!, $search: String, $page: Int, $limit: Int, $subadminId: ID) {
		getExtras(superadminId: $superadminId, search: $search, page: $page, limit: $limit, subadminId: $subadminId) {
			extras {
				id
				name
				price
				superadminId
				subadminId
				createdAt
				updatedAt
			}
			totalCount
			totalPages
			currentPage
		}
	}
`;
export const getExtraById = gql`
	query GetExtra($getExtraId: ID!) {
		getExtra(id: $getExtraId) {
			id
			name
			price
			superadminId
			subadminId
			createdAt
			updatedAt
		}
	}
`;
export const deleteExtra = gql`
	mutation DeleteExtra($deleteExtraId: ID!) {
		deleteExtra(id: $deleteExtraId) {
			success
			message
			extra {
				id
				name
				price
				superadminId
				subadminId
				createdAt
				updatedAt
			}
		}
	}
`;
export const createSize = gql`
	mutation CreateSize($name: String!, $price: Float!, $superadminId: ID!, $subadminId: ID) {
		createSize(name: $name, price: $price, superadminId: $superadminId, subadminId: $subadminId) {
			success
			message
			size {
				id
				name
				price
				superadminId
				subadminId
				createdAt
				updatedAt
			}
		}
	}
`;
export const updateSize = gql`
	mutation UpdateSize($updateSizeId: ID!, $name: String, $price: Float) {
		updateSize(id: $updateSizeId, name: $name, price: $price) {
			success
			message
			size {
				id
				name
				price
				superadminId
				subadminId
				createdAt
				updatedAt
			}
		}
	}
`;
export const getSizes = gql`
	query GetSizes($superadminId: ID!, $search: String, $page: Int, $limit: Int, $subadminId: ID) {
		getSizes(superadminId: $superadminId, search: $search, page: $page, limit: $limit, subadminId: $subadminId) {
			sizes {
				id
				name
				price
				superadminId
				subadminId
				createdAt
				updatedAt
			}
			totalCount
			totalPages
			currentPage
		}
	}
`;
export const getSizesById = gql`
	query GetSize($getSizeId: ID!) {
		getSize(id: $getSizeId) {
			id
			name
			price
			superadminId
			subadminId
			createdAt
			updatedAt
		}
	}
`;
export const deleteSize = gql`
	mutation DeleteSize($deleteSizeId: ID!) {
		deleteSize(id: $deleteSizeId) {
			success
			message
			size {
				id
				name
				price
				superadminId
				subadminId
				createdAt
				updatedAt
			}
		}
	}
`;
