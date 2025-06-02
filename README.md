# Authentication System

A full-stack authentication system built with Next.js, Node.js, and MongoDB. Features include user registration, login, JWT authentication, and protected routes.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Environment Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd cromwell-tech-test
```

2. Set up environment variables:

Create `.env` in the server directory:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
CORS_ORIGIN=http://localhost:3001
```

Create `.env` in the client directory:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### Backend Setup

1. Navigate to server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The server will run on http://localhost:3000

### Frontend Setup

1. Open a new terminal and navigate to client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will run on http://localhost:3001

## 🛠️ Tech Stack

### Frontend

- Next.js 14
- TypeScript
- Redux Toolkit
- TailwindCSS
- Zod (validation)

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- Zod (validation)

## 📝 Features

- User registration and login
- JWT authentication with refresh tokens
- Protected routes
- Form validation
- Responsive design
- Secure password handling
- MongoDB integration

## 🔒 Security Features

- Password hashing with bcrypt
- JWT for authentication
- HTTP-only cookies for refresh tokens
- Input validation
- Protected API routes
- CORS configuration

## 🧪 Testing

### Backend Tests

```bash
cd server
npm test
```

## 📁 Project Structure

```
├── client/                 # Frontend Next.js application
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   ├── store/         # Redux store and slices
│   │   └── validation/    # Zod schemas
│   └── public/            # Static files
│
└── server/                # Backend Express application
    ├── src/
    │   ├── controllers/   # Route controllers
    │   ├── middleware/    # Custom middleware
    │   ├── models/        # Mongoose models
    │   ├── routes/        # API routes
    │   └── validation/    # Zod schemas
    └── tests/             # Test files
```
