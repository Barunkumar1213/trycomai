# Email Workflow Backend

A backend service for managing email workflows, calendar integration, and AI-powered email processing.

## Features

- Email management with Gmail API
- Calendar integration for scheduling and availability
- AI-powered email processing with OpenAI
- RESTful API with Express.js
- TypeScript for type safety
- Environment-based configuration
- Module aliases for cleaner imports
- ESLint and Prettier for code quality

## Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB (for data persistence)
- Google Cloud Platform account with Gmail and Calendar APIs enabled
- OpenAI API key

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/email-workflow
   
   # Google OAuth2
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   
   # OpenAI
   OPENAI_API_KEY=your-openai-api-key
   
   # JWT
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRES_IN=7d
   ```

4. Generate SSL certificates (for local development):
   ```bash
   mkdir -p ssl
   openssl req -nodes -new -x509 -keyout ssl/key.pem -out ssl/cert.pem -days 365
   ```

## Development

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. The server will be available at `http://localhost:5000`

## Building for Production

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Start the production server:
   ```bash
   npm start
   # or
   yarn start
   ```

## API Documentation

API documentation is available at `/api-docs` when running in development mode.

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| PORT | Port to run the server on | No | 5000 |
| NODE_ENV | Environment (development, production) | No | development |
| MONGODB_URI | MongoDB connection string | Yes | - |
| GOOGLE_CLIENT_ID | Google OAuth2 client ID | Yes | - |
| GOOGLE_CLIENT_SECRET | Google OAuth2 client secret | Yes | - |
| GOOGLE_REDIRECT_URI | Google OAuth2 redirect URI | Yes | - |
| OPENAI_API_KEY | OpenAI API key | Yes | - |
| JWT_SECRET | Secret for JWT token signing | Yes | - |
| JWT_EXPIRES_IN | JWT token expiration time | No | 7d |

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── models/           # Database models
├── routes/           # API routes
├── services/         # Business logic
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── app.ts            # Express application
└── index.ts          # Application entry point
```

## Code Style

This project uses ESLint and Prettier for code formatting. You can run the following commands:

```bash
# Check for linting errors
npm run lint

# Format code
npm run format
```

## Testing

To run tests:

```bash
npm test
# or
yarn test
```

## License

[MIT](LICENSE)
