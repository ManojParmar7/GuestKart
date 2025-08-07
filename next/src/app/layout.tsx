"use client";

import * as React from "react";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { createUploadLink } from "apollo-upload-client";
import { Toaster } from "react-hot-toast";

import { UserProvider } from "@/contexts/user-context";
import { LocalizationProvider } from "@/components/core/localization-provider";
import { ThemeProvider } from "@/components/core/theme-provider/theme-provider";

import "@/styles/global.css";

// Create upload link
const uploadLink = createUploadLink({
	uri: "http://localhost:8000/graphql",
});

// Add auth header if needed
const authLink = setContext((_, { headers }) => {
	const token = typeof window !== "undefined" ? localStorage.getItem("custom-auth-token") : null;

	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : "",
		},
	};
});

// Apollo client setup
const client = new ApolloClient({
	link: authLink.concat(uploadLink),
	cache: new InMemoryCache(),
});

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<Toaster position="top-right" />
				<ApolloProvider client={client}>
					<LocalizationProvider>
						<UserProvider>
							<ThemeProvider>{children}</ThemeProvider>
						</UserProvider>
					</LocalizationProvider>
				</ApolloProvider>
			</body>
		</html>
	);
}
