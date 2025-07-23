<!-- @format -->

# MongoDB Setup Guide for Library Management System

This guide will help you set up MongoDB for the Library Management System. You have three options:

## Option 1: MongoDB Memory Server (Current - Development Only)

This is already configured and running. It creates an in-memory database that's perfect for development and testing.

**Pros:**

- No setup required
- Automatic data seeding
- Perfect for development

**Cons:**

- Data is lost when server restarts
- Not suitable for production

## Option 2: Local MongoDB Installation

### Step 1: Install MongoDB

**macOS (using Homebrew):**

```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Ubuntu/Debian:**

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

**Windows:**
Download and install from: https://www.mongodb.com/try/download/community

### Step 2: Start MongoDB Service

**macOS:**

```bash
brew services start mongodb/brew/mongodb-community
```

**Ubuntu/Linux:**

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**
MongoDB should start automatically as a service.

### Step 3: Update Environment Variables

Copy `.env.template` to `.env` and update:

```env
MONGODB_URI=mongodb://localhost:27017/library-management
SEED_DATA=true
```

## Option 3: MongoDB Atlas (Cloud Database)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/atlas
2. Sign up for a free account
3. Create a new cluster (free tier available)

### Step 2: Configure Database Access

1. Go to "Database Access" in your Atlas dashboard
2. Add a new database user with read/write permissions
3. Note down the username and password

### Step 3: Configure Network Access

1. Go to "Network Access" in your Atlas dashboard
2. Add your IP address or use 0.0.0.0/0 for development (not recommended for production)

### Step 4: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string

### Step 5: Update Environment Variables

Copy `.env.template` to `.env` and update:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library-management?retryWrites=true&w=majority
SEED_DATA=true
```

Replace `username`, `password`, and `cluster` with your actual values.

## Environment Variables Explanation

| Variable        | Description                  | Default                 |
| --------------- | ---------------------------- | ----------------------- |
| `MONGODB_URI`   | MongoDB connection string    | `memory`                |
| `SEED_DATA`     | Whether to seed initial data | `true`                  |
| `JWT_SECRET`    | Secret key for JWT tokens    | Required                |
| `JWT_EXPIRE`    | JWT token expiration time    | `7d`                    |
| `PORT`          | Server port                  | `5000`                  |
| `NODE_ENV`      | Environment mode             | `development`           |
| `CLIENT_URL`    | Frontend URL for CORS        | `http://localhost:3000` |
| `BCRYPT_ROUNDS` | Password hashing rounds      | `12`                    |

## Quick Setup Commands

### For Local MongoDB:

```bash
# Copy environment template
cp .env.template .env

# Edit the .env file to use local MongoDB
# Change MONGODB_URI=memory to MONGODB_URI=mongodb://localhost:27017/library-management

# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community

# Start the server
npm start
```

### For MongoDB Atlas:

```bash
# Copy environment template
cp .env.template .env

# Edit the .env file with your Atlas connection string
# Change MONGODB_URI to your Atlas connection string

# Start the server
npm start
```

## Verification

After setup, you should see one of these messages when starting the server:

**Memory Server:**

```
Connected to MongoDB Memory Server
Database seeded successfully!
```

**Local/Atlas MongoDB:**

```
Connected to MongoDB
Database seeded successfully!
```

## Demo Data

When `SEED_DATA=true`, the system will create:

- 2 users (1 librarian, 1 borrower)
- 6 books with various genres
- 4 sample borrow records

**Demo Credentials:**

- Librarian: `librarian@library.com` / `password123`
- Borrower: `borrower@library.com` / `password123`

## Troubleshooting

### Connection Issues

1. Check if MongoDB service is running
2. Verify connection string format
3. Check network access (for Atlas)
4. Ensure database user has proper permissions

### Port Conflicts

If port 5000 is in use:

```bash
PORT=5001 npm start
```

### Data Not Seeding

1. Check `SEED_DATA` environment variable
2. Verify database permissions
3. Check server logs for errors

## Production Considerations

For production deployment:

1. Use MongoDB Atlas or a managed MongoDB service
2. Set strong `JWT_SECRET`
3. Configure proper network access rules
4. Set `NODE_ENV=production`
5. Use environment-specific connection strings
6. Set `SEED_DATA=false` to avoid overwriting production data
