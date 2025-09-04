import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = new HttpLink({
	uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`, // <-- change to your actual GraphQL server
});

// Auth middleware
const authLink = setContext((_, { headers }) => {
	const token = typeof window !== "undefined" ? localStorage.getItem("custom-auth-token") : null;
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : "",
		},
	};
});

// Apollo Client
const client = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache(),
});

export default client;
