<!-- @format -->

# Library Management System - Backend API

A comprehensive RESTful API for a library management system built with Express.js, MongoDB, and JWT authentication.

## Features

- **Authentication & Authorization**

  - JWT-based authentication
  - Role-based access control (Borrowers vs Librarians)
  - Password hashing with bcrypt
  - Input validation and sanitization

- **User Management**

  - User registration and login
  - Profile management
  - Password change functionality

- **Book Management**

  - CRUD operations for books (Librarians only)
  - Book search and filtering
  - ISBN validation
  - Inventory tracking

- **Borrowing System**
  - Book borrowing and returning
  - Borrow history tracking
  - Overdue book management
  - Renewal functionality
  - Borrowing limits and validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Environment Variables**: dotenv
- **CORS**: cors middleware

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd library-management-system/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory:

   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/library-management

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # CORS Configuration
   CLIENT_URL=http://localhost:3000

   # Bcrypt Configuration
   BCRYPT_ROUNDS=12
   ```

4. **Start the server**

   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint           | Description         | Access  |
| ------ | ------------------ | ------------------- | ------- |
| POST   | `/register`        | Register new user   | Public  |
| POST   | `/login`           | User login          | Public  |
| GET    | `/profile`         | Get user profile    | Private |
| PUT    | `/profile`         | Update user profile | Private |
| POST   | `/change-password` | Change password     | Private |
| POST   | `/verify-token`    | Verify JWT token    | Private |

### Book Routes (`/api/books`)

| Method | Endpoint              | Description                        | Access    |
| ------ | --------------------- | ---------------------------------- | --------- |
| GET    | `/`                   | Get all books (with search/filter) | Public    |
| GET    | `/:id`                | Get single book                    | Public    |
| POST   | `/`                   | Create new book                    | Librarian |
| PUT    | `/:id`                | Update book                        | Librarian |
| DELETE | `/:id`                | Delete book                        | Librarian |
| GET    | `/search/suggestions` | Get search suggestions             | Public    |

### Borrow Routes (`/api/borrow`)

| Method | Endpoint      | Description               | Access    |
| ------ | ------------- | ------------------------- | --------- |
| POST   | `/`           | Borrow a book             | Private   |
| POST   | `/return`     | Return a book             | Private   |
| GET    | `/my-borrows` | Get user's borrow history | Private   |
| GET    | `/records`    | Get all borrow records    | Librarian |
| GET    | `/overdue`    | Get overdue books         | Librarian |
| GET    | `/stats`      | Get borrowing statistics  | Librarian |
| POST   | `/:id/renew`  | Renew a borrowed book     | Private   |

## Data Models

### User Model

```javascript
{
  name: String (required, 2-50 chars, no numbers),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars, hashed),
  role: String (enum: ['borrower', 'librarian'], default: 'borrower'),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Book Model

```javascript
{
  title: String (required, max 200 chars),
  author: String (required, max 100 chars),
  isbn: String (required, unique, valid ISBN format),
  quantity: Number (required, min 0),
  available: Number (required, min 0),
  genre: String (optional, max 50 chars),
  description: String (optional, max 1000 chars),
  publishedYear: Number (optional, valid year),
  publisher: String (optional, max 100 chars),
  language: String (optional, max 30 chars, default: 'English'),
  pages: Number (optional, min 1),
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User)
}
```

### Borrow Model

```javascript
{
  userId: ObjectId (ref: User, required),
  bookId: ObjectId (ref: Book, required),
  borrowDate: Date (required, default: now),
  dueDate: Date (required, default: +14 days),
  returnDate: Date (optional),
  status: String (enum: ['borrowed', 'returned', 'overdue']),
  renewalCount: Number (default: 0, max: 3),
  notes: String (optional, max 500 chars),
  isActive: Boolean (default: true)
}
```

## Request/Response Examples

### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "borrower"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Book (Librarian)

```bash
POST /api/books
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0743273565",
  "quantity": 5,
  "available": 5,
  "genre": "Fiction",
  "publishedYear": 1925
}
```

### Borrow Book

```bash
POST /api/borrow
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "bookId": "60d5ecb74b24a1234567890a"
}
```

## Error Handling

The API uses consistent error response format:

```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [...] // Validation errors (if applicable)
}
```

## Validation Rules

### User Registration

- Name: 2-50 characters, letters and spaces only
- Email: Valid email format, unique
- Password: Minimum 6 characters, at least one letter and one number

### Book Creation

- Title: Required, max 200 characters
- Author: Required, max 100 characters
- ISBN: Required, valid ISBN-10 or ISBN-13 format
- Quantity: Non-negative integer
- Available copies: Cannot exceed total quantity

### Borrowing Rules

- Maximum 5 books per user
- Cannot borrow same book twice
- Maximum 3 renewals per book
- 14-day borrowing period

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- Input validation and sanitization
- Role-based access control
- CORS protection
- MongoDB injection prevention

## Development

### Running Tests

```bash
npm test
```

### Code Structure

```
backend/
├── models/          # Mongoose schemas
├── routes/          # Express route handlers
├── middleware/      # Custom middleware
├── controllers/     # Business logic (optional)
├── utils/           # Utility functions
├── server.js        # Main application file
├── .env            # Environment variables
└── package.json    # Dependencies and scripts
```

### Environment Variables

| Variable        | Description                | Default                                        |
| --------------- | -------------------------- | ---------------------------------------------- |
| `MONGODB_URI`   | MongoDB connection string  | `mongodb://localhost:27017/library-management` |
| `JWT_SECRET`    | Secret key for JWT signing | Required                                       |
| `JWT_EXPIRE`    | JWT token expiration time  | `7d`                                           |
| `PORT`          | Server port                | `5000`                                         |
| `NODE_ENV`      | Environment mode           | `development`                                  |
| `BCRYPT_ROUNDS` | Bcrypt hashing rounds      | `12`                                           |

## Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Use MongoDB Atlas or secure MongoDB instance
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up SSL/HTTPS
- [ ] Configure logging
- [ ] Set up monitoring

### Deployment Platforms

- **Render**: Easy deployment with MongoDB Atlas
- **Heroku**: Classic PaaS platform
- **Railway**: Modern deployment platform
- **DigitalOcean App Platform**: Scalable deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
