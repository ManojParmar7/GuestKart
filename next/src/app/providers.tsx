"use client";

import * as React from "react";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { Toaster } from "react-hot-toast";

import { UserProvider } from "@/contexts/user-context";
import { LocalizationProvider } from "@/components/core/localization-provider";
import { ThemeProvider } from "@/components/core/theme-provider/theme-provider";

const uploadLink = createUploadLink({
	uri: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/graphql`,
});

const authLink = setContext((_, { headers }) => {
	const token = typeof window !== "undefined" ? localStorage.getItem("custom-auth-token") : null;
	return { headers: { ...headers, authorization: token ? `Bearer ${token}` : "" } };
});

const client = new ApolloClient({
	link: authLink.concat(uploadLink),
	cache: new InMemoryCache(),
});

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<ApolloProvider client={client}>
			<LocalizationProvider>
				<UserProvider>
					<ThemeProvider>{children}</ThemeProvider>
					<Toaster position="top-right" />
				</UserProvider>
			</LocalizationProvider>
		</ApolloProvider>
	);
}
