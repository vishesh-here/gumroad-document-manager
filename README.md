# Document Portal

A full-stack document management application with user authentication and admin capabilities. Built with React, Node.js, Express, and SQLite.

## Features

- User Authentication
- Document Management
- Admin Dashboard
- Secure Document Access
- Modern Skeuomorphic UI Design

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: SQLite
- Styling: Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd document-portal
```

2. Install server dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
```

## Configuration

1. Create a `.env` file in the root directory:
```
PORT=9000
JWT_SECRET=your_jwt_secret
```

2. Create a `.env` file in the client directory:
```
PORT=9001
```

## Running the Application

1. Start the development server:
```bash
npm start
```

This will concurrently run:
- Backend server on port 9000
- Frontend client on port 9001

## Demo Credentials

- Regular User:
  - Email: user@example.com
  - Password: user123

- Admin User:
  - Email: admin@example.com
  - Password: admin123

## License

MIT 