# MOV Mobile App

A React Native mobile app built with Expo for sharing videos and photos at events.

## Setup

### Prerequisites

- Node.js and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g eas-cli`)
- Expo account

### 1. Install Dependencies

```bash
npm install
```

### 2. EAS Build Setup

#### Create Environment Variables

Create environment profiles for each build environment:

```bash
eas env:create --environment development
eas env:create --environment preview
eas env:create --environment production
```

Each profile will have the environment variable:

- `EXPO_PUBLIC_ENV`: Set to the profile name (development/preview/production)

#### Build Commands

```bash
# Development builds
npm run build:dev:android
npm run build:dev:ios

# Preview builds
npm run build:preview:android
npm run build:preview:ios

# Production builds
npm run build:prod:android
npm run build:prod:ios
```

### 3. iOS Device Setup

For iOS testing, you need to register your device with EAS:

```bash
eas device:create
```

Example device UUID: `00008140-00094DC22642801C`

### 4. Local Development Configuration

Update `lib/config.ts` with your local IP address for the development environment:

```typescript
development: {
  NODE_ENV: "development",
  EXPO_PUBLIC_API_URL: "http://YOUR_LOCAL_IP:3000", // Update this
  // ... other config
}
```

### 5. Database Setup

You'll need to set up Supabase databases for each environment:

- Development database
- Preview database
- Production database

### 6. Web Repository Setup

Set up the corresponding web repository for each environment to handle invite links and web features.

## Development

```bash
# Start development server
npm start

# Start with dev client
npm run start:dev

# Run on specific platform
npm run ios
npm run android
```

## Project Structure

- `app/` - Expo Router screens and navigation
- `components/` - Reusable React components
- `contexts/` - React Context providers
- `hooks/` - Custom React hooks
- `services/` - API and external service integrations
- `lib/` - Configuration and utilities
- `types/` - TypeScript type definitions
