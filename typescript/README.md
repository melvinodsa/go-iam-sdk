# @goiam/typescript

TypeScript SDK for Go IAM - A lightweight Identity and Access Management server.

## Installation

```bash
npm install @goiam/typescript
# or
pnpm add @goiam/typescript
# or
yarn add @goiam/typescript
```

## Usage

### Initialize the SDK

```typescript
import { GoIamSdk } from "@goiam/typescript";

const sdk = new GoIamSdk(
  "https://go-iam.example.com",
  "your-client-id",
  "your-secret"
);
```

### Verify Authentication Code

```typescript
try {
  const token = await sdk.verify("auth-code");
  console.log("Access Token:", token);
} catch (error) {
  console.error("Failed to verify code:", error);
}
```

### Fetch Current User Information

```typescript
try {
  const user = await sdk.me(token);
  console.log("User:", user);
} catch (error) {
  console.error("Failed to fetch user information:", error);
}
```

### Create a Resource

```typescript
const resource = {
  id: "resource-id",
  name: "Resource Name",
  description: "Resource Description",
  key: "resource-key",
  enabled: true,
  projectId: "project-id",
  createdBy: "creator",
  updatedBy: "updater",
};

try {
  await sdk.createResource(resource, token);
  console.log("Resource created successfully");
} catch (error) {
  console.error("Failed to create resource:", error);
}
```

## Types

The SDK exports the following TypeScript interfaces:

### User

```typescript
interface User {
  id: string;
  projectId: string;
  name: string;
  email: string;
  phone: string;
  enabled: boolean;
  profilePic: string;
  expiry?: string;
  roles: Record<string, UserRole>;
  resources: Record<string, UserResource>;
  policies: Record<string, string>;
  createdAt?: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy: string;
}
```

### Resource

```typescript
interface Resource {
  id: string;
  name: string;
  description: string;
  key: string;
  enabled: boolean;
  projectId: string;
  createdAt?: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy: string;
  deletedAt?: string;
}
```

## Error Handling

The SDK methods throw errors with descriptive messages. It's recommended to wrap API calls in try-catch blocks:

```typescript
try {
  const result = await sdk.verify("code");
  // Handle success
} catch (error) {
  console.error("API Error:", error.message);
  // Handle error
}
```

## Related Projects

> ✅ Admin UI: [go-iam-ui](https://github.com/melvinodsa/go-iam-ui)  
> 🐳 Docker Setup: [go-iam-docker](https://github.com/melvinodsa/go-iam-docker)  
> 🔐 Backend: [go-iam](https://github.com/melvinodsa/go-iam)  
> 📦 SDK: [go-iam-sdk](https://github.com/melvinodsa/go-iam-sdk)
> 📦 Examples: [go-iam-sdk](https://github.com/melvinodsa/go-iam-examples)

## License

MIT
