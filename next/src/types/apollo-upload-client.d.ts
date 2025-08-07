declare module "apollo-upload-client" {
  import { ApolloLink } from "@apollo/client";

  export interface UploadLinkOptions {
    uri?: string;
    credentials?: string;
    headers?: any;
  }

  export function createUploadLink(options: UploadLinkOptions): ApolloLink;
}
