# GoIAM React SDK - Examples

This directory contains usage examples for the GoIAM React SDK.

## Development vs Production Imports

### During Development (Local)

When working with the source code locally, import from the source files:

```tsx
import { GoIamProvider, useGoIam, AuthGuard, createGoIamConfig } from '../src/index';
```

### After Publishing (Production)

When the package is published to npm, import from the package name:

```tsx
import { GoIamProvider, useGoIam, AuthGuard, createGoIamConfig } from '@goiam/react';
```

## Testing Examples Locally

If you want to test the examples as if they were using the published package, you have several options:

### Option 1: Use npm link (Recommended)

```bash
# In the react directory
npm run link:local

# In your test project
npm link @goiam/react
```

### Option 2: Install locally built package

```bash
# In the react directory
npm run install:local
```

### Option 3: Use relative imports (Current approach)

The examples currently use relative imports (`../src/index`) which work directly with the source files.

## Running Examples

The examples are written in TypeScript/TSX format and are meant to be copied into your React application. They demonstrate:

- Basic setup with GoIamProvider
- Authentication hooks usage
- Protected routes with AuthGuard
- Role-based access control
- Error handling
- Loading states

## Files

- `basic-usage.tsx` - Complete example showing all main features
- `README.md` - This file with setup instructions
