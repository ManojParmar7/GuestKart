"use client";

import * as React from "react";

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
	console.log("user: ", user);
	const [error, setError] = React.useState<string | null>(null);
	const [isLoading, setIsLoading] = React.useState<boolean>(true);

	const checkSession = React.useCallback(async (): Promise<void> => {
		setIsLoading(true);
		try {
			const { data, error } = await authClient.getUser();

			if (error) {
				logger.error(error);
				setUser(null);
				setError("Something went wrong");
			} else {
				setUser(data ?? null);
				setError(null);
			}
		} catch (err) {
			logger.error(err);
			setUser(null);
			setError("Something went wrong");
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
