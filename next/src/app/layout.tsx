import type { Metadata } from "next";

import { Providers } from "./providers";

import "@/styles/global.css";

export const metadata: Metadata = {
	title: "GuestKart | Thoughtful everyday finds",
	description: "Discover useful, well-chosen finds from GuestKart sellers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
