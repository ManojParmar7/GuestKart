declare module "apollo-upload-client/createUploadLink.mjs" {
	import type { ApolloLink } from "@apollo/client";

	const createUploadLink: (options: { uri: string }) => ApolloLink;
	export default createUploadLink;
}
