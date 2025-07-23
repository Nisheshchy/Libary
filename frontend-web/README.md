<!-- @format -->

# Library Management System - Web Frontend

A React-based web application for the Library Management System with authentication, role-based access control, and comprehensive book management features.

## Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (Borrowers vs Librarians)
- Secure login/registration with input validation
- Protected routes and components

### User Roles

- **Borrowers**: Browse books, borrow/return books, manage profile
- **Librarians**: Full CRUD operations on books, view borrow records, user management

### Core Functionality

- **Dashboard**: Overview of library statistics and recent activity
- **Book Management**: Browse, search, add, edit, and delete books
- **Borrowing System**: Borrow and return books with due date tracking
- **Profile Management**: Update user information
- **Responsive Design**: Mobile-first approach with vanilla CSS

## Technology Stack

- **React 19** with TypeScript
- **React Router** for navigation
- **Context API** for state management
- **Axios** for API communication
- **Vanilla CSS** with Flexbox and CSS Grid
- **Mobile-first responsive design**

## Project Structure

```
src/
├── components/
│   ├── auth/           # Login and registration components
│   ├── common/         # Reusable components (LoadingSpinner, etc.)
│   ├── dashboard/      # Dashboard component
│   └── layout/         # Layout and navigation components
├── contexts/           # React Context providers
├── services/           # API service functions
├── App.tsx            # Main application component
├── index.tsx          # Application entry point
└── index.css          # Global styles
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API server running

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment variables:

```bash
cp .env.example .env
```

3. Update `.env` with your configuration:

```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm start
```

The application will open at `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## API Integration

The frontend communicates with the backend API through the following endpoints:

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Books

- `GET /books` - Get all books with pagination and search
- `POST /books` - Create new book (Librarians only)
- `PUT /books/:id` - Update book (Librarians only)
- `DELETE /books/:id` - Delete book (Librarians only)

### Borrowing

- `POST /borrow` - Borrow a book
- `POST /borrow/return` - Return a book
- `GET /borrow/my-borrows` - Get user's borrow history

## Component Architecture

### Authentication Flow

1. **AuthContext** manages authentication state
2. **PrivateRoute** protects authenticated routes
3. **Login/Register** components handle user authentication
4. JWT tokens stored in localStorage with automatic refresh

### Layout System

- **Layout** component provides consistent navigation and structure
- **Responsive sidebar** with role-based navigation items
- **Header** with user info and logout functionality

### State Management

- **Context API** for global state (authentication, user data)
- **Local state** for component-specific data
- **API services** for data fetching and caching

## Styling Approach

### CSS Architecture

- **Mobile-first** responsive design
- **Vanilla CSS** with modern features (Flexbox, Grid, Custom Properties)
- **Component-scoped** CSS files
- **Global utilities** in index.css

### Design System

- **Color Palette**: Primary (#4f46e5), Secondary (#10b981), Neutral grays
- **Typography**: System font stack with consistent sizing scale
- **Spacing**: 0.25rem base unit with consistent spacing scale
- **Components**: Cards, buttons, forms with consistent styling

## Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features

- **Collapsible sidebar** navigation
- **Touch-friendly** button sizes
- **Optimized layouts** for small screens
- **Readable typography** at all sizes

## Accessibility

- **Semantic HTML** structure
- **ARIA labels** for interactive elements
- **Keyboard navigation** support
- **Focus management** for modals and forms
- **Color contrast** compliance

## Performance Optimizations

- **Code splitting** with React.lazy
- **Memoization** for expensive computations
- **Optimized images** and assets
- **Efficient re-renders** with proper key props

## Testing Strategy

- **Unit tests** for utility functions
- **Component tests** with React Testing Library
- **Integration tests** for user flows
- **E2E tests** for critical paths

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `build` folder to Netlify
3. Configure redirects for SPA routing

## Environment Variables

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Optional: Enable development features
REACT_APP_DEBUG=true
```

## Browser Support

- **Chrome** (latest 2 versions)
- **Firefox** (latest 2 versions)
- **Safari** (latest 2 versions)
- **Edge** (latest 2 versions)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.
