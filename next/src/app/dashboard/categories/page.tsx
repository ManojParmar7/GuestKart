import { Metadata } from "next";

// eslint-disable-next-line import/no-unresolved
import ClientPage from "./client-page";

export const metadata: Metadata = {
	title: `Customers | Dashboard | YourSiteName`,
};

export default function Page() {
	// eslint-disable-next-line react/react-in-jsx-scope
	return <ClientPage />;
}
