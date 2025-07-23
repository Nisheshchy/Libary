<!-- @format -->

# Library Management System

A comprehensive library management system with authentication, role-based access control, and full CRUD operations for books and borrowing records.

## Features

### Authentication & Authorization

- JWT-based authentication with bcrypt password hashing
- Role-based access control (Borrowers vs Librarians)
- Input validation and error handling
- Secure session management

### User Roles

- **Borrowers**: Can browse books, borrow/return books, manage profile
- **Librarians**: Full CRUD operations on books, view borrow records, user management

### Technology Stack

- **Backend**: Express.js + MongoDB (Mongoose)
- **Web Frontend**: React + React Router + Context API
- **Mobile Frontend**: React Native (Expo)
- **Database**: MongoDB Atlas
- **Authentication**: JWT + bcrypt
- **Styling**: Vanilla CSS (mobile-first, responsive)

## Project Structure

```
library-management-system/
├── backend/                 # Express.js API server
├── frontend-web/           # React web application
├── frontend-mobile/        # React Native mobile app
├── docs/                   # Documentation and wireframes
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB Atlas account
- Expo CLI (for mobile development)

### Installation

1. Clone the repository
2. Install backend dependencies: `cd backend && npm install`
3. Install web frontend dependencies: `cd frontend-web && npm install`
4. Install mobile frontend dependencies: `cd frontend-mobile && npm install`
5. Set up environment variables (see individual README files)
6. Start the development servers

## API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Books (Librarians only for CUD operations)

- `GET /books` - Get all books
- `POST /books` - Create new book
- `PUT /books/:id` - Update book
- `DELETE /books/:id` - Delete book

### Borrowing

- `POST /borrow` - Borrow a book
- `POST /borrow/return` - Return a book
- `GET /borrow/records` - Get borrow records

## Data Models

### User Model

```javascript
{
  email: String (unique),
  password: String (hashed),
  role: String ("borrower" | "librarian"),
  name: String
}
```

### Book Model

```javascript
{
  title: String,
  author: String,
  isbn: String (unique),
  quantity: Number,
  available: Number
}
```

### Borrow Model

```javascript
{
  userId: ObjectId (ref: User),
  bookId: ObjectId (ref: Book),
  borrowDate: Date,
  returnDate: Date (null if not returned)
}
```

## Deployment

- **Backend**: Render
- **Web Frontend**: Vercel/Netlify
- **Mobile App**: Expo (published URL/QR code)
- **Database**: MongoDB Atlas

## Testing

- API testing with Postman
- Manual testing for web and mobile interfaces
- Responsive design testing across devices
