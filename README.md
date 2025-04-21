# Express TypeScript Project

A RESTful API built with Express and TypeScript.

## Project Structure

```
src/
├── app.ts                  # Express app setup
├── server.ts               # Server entry point
├── config/                 # Configuration files
├── controllers/            # Request handlers
├── middleware/             # Custom middleware
├── models/                 # Database models
├── routes/                 # Route definitions
├── services/               # Business logic
├── types/                  # TypeScript interfaces
└── utils/                  # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Start development server: `npm run dev`

### Scripts

- `npm start` - Run production server
- `npm run dev` - Run development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## API Endpoints

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PATCH /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user