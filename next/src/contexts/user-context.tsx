"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import type { User } from "@/types/user";
import { authClient } from "@/lib/auth/client";
import { logger } from "@/lib/default-logger";

export interface UserContextValue {
	user: User | null;
	error: string | null;
	isLoading: boolean;
	checkSession: () => Promise<void>;
	setUserManually: (newUser: User | null) => void;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
	children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
	const [user, setUser] = React.useState<User | null>(null);
	const [error, setError] = React.useState<string | null>(null);
	const [isLoading, setIsLoading] = React.useState<boolean>(true);
	const router = useRouter();

	// const checkSession = React.useCallback(async (): Promise<void> => {
	// 	setIsLoading(true);
	// 	try {
	// 		const { data, error } = await authClient.getUser();

	// 		if (error) {
	// 			logger.error(error);
	// 			setUser(null);
	// 			setError("Something went wrong");
	// 		} else {
	// 			setUser(data ?? null);
	// 			setError(null);
	// 		}
	// 	} catch (err) {
	// 		logger.error(err);
	// 		setUser(null);
	// 		setError("Something went wrong");
	// 	} finally {
	// 		setIsLoading(false);
	// 	}
	// }, []);
	const checkSession = React.useCallback(async (): Promise<void> => {
		setIsLoading(true);
		try {
			const { data, error } = await authClient.getUser();

			if (error) {
				logger.error(error);

				// Clear local storage tokens
				localStorage.removeItem("login_id");
				localStorage.removeItem("custom-auth-token");

				// Redirect to sign-in page
				router.push("/auth/sign-in");
				// Stop execution
				return;
			} else {
				setUser(data ?? null);
				setError(null);
			}
		} catch (err: any) {
			logger.error(err);

			// Clear local storage tokens
			localStorage.removeItem("login_id");
			localStorage.removeItem("custom-auth-token");

			// Redirect to sign-in page
			router.push("/auth/sign-in");

			// Stop execution
			return;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const setUserManually = (newUser: User | null) => {
		setUser(newUser);
	};

	React.useEffect(() => {
		checkSession();
	}, [checkSession]);

	return (
		<UserContext.Provider value={{ user, error, isLoading, checkSession, setUserManually }}>
			{children}
		</UserContext.Provider>
	);
}

export const UserConsumer = UserContext.Consumer;
