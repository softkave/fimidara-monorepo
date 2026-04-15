// import { FileBackendType } from "fimidara";

// export interface NewBackendConfigInput {
//   backend: FileBackendType;
//   credentials: Record<string, unknown>;
//   name: string;
//   description?: string;
// }

// export type UpdateBackendConfigInput = Partial<
//   Pick<NewBackendConfigInput, "credentials" | "description" | "name">
// >;

// export const kBackendConfigType = {
//   s3: "aws-s3",
// };

// export interface AWSS3BackendConfig {
//   accessKeyId: string;
//   secretAccessKey: string;
//   region: string;
// }

// export const kBackendConfigConstants = {
//   awsAccessKeyIdLength: 20,
//   awsSecretAccessKeyLength: 40,
//   awsRegions: [
//     "us-east-2",
//     "us-east-1",
//     "us-west-1",
//     "us-west-2",
//     "af-south-1",
//     "ap-east-1",
//     "ap-south-2",
//     "ap-southeast-3",
//     "ap-southeast-4",
//     "ap-south-1",
//     "ap-northeast-3",
//     "ap-northeast-2",
//     "ap-southeast-1",
//     "ap-southeast-2",
//     "ap-northeast-1",
//     "ca-central-1",
//     "eu-central-1",
//     "eu-west-1",
//     "eu-west-2",
//     "eu-south-1",
//     "eu-west-3",
//     "eu-south-2",
//     "eu-north-1",
//     "eu-central-2",
//     "il-central-1",
//     "me-south-1",
//     "me-central-1",
//     "sa-east-1",
//   ],
// };
