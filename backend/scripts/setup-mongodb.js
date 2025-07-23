#!/usr/bin/env node
/** @format */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const envPath = path.join(__dirname, "..", ".env");
const templatePath = path.join(__dirname, "..", ".env.template");

console.log("🚀 MongoDB Setup for Library Management System\n");

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupMongoDB() {
  try {
    console.log("Choose your MongoDB setup option:\n");
    console.log("1. MongoDB Memory Server (Development - Current)");
    console.log("2. Local MongoDB Installation");
    console.log("3. MongoDB Atlas (Cloud Database)");
    console.log("4. Custom MongoDB URI\n");

    const choice = await askQuestion("Enter your choice (1-4): ");

    let mongoUri = "";
    let seedData = "true";

    switch (choice.trim()) {
      case "1":
        mongoUri = "memory";
        console.log(
          "\n✅ Using MongoDB Memory Server (no additional setup required)"
        );
        break;

      case "2":
        mongoUri = "mongodb://localhost:27017/library-management";
        console.log("\n📝 Local MongoDB Setup:");
        console.log(
          "Make sure MongoDB is installed and running on your system."
        );
        console.log("\nInstallation commands:");
        console.log(
          "macOS: brew install mongodb-community && brew services start mongodb/brew/mongodb-community"
        );
        console.log(
          "Ubuntu: sudo apt-get install mongodb && sudo systemctl start mongod"
        );
        console.log(
          "Windows: Download from https://www.mongodb.com/try/download/community"
        );
        break;

      case "3":
        console.log("\n🌐 MongoDB Atlas Setup:");
        console.log("1. Create account at https://www.mongodb.com/atlas");
        console.log("2. Create a cluster (free tier available)");
        console.log("3. Add database user and configure network access");
        console.log("4. Get your connection string\n");

        mongoUri = await askQuestion(
          "Enter your MongoDB Atlas connection string: "
        );
        break;

      case "4":
        mongoUri = await askQuestion("Enter your custom MongoDB URI: ");
        break;

      default:
        console.log("❌ Invalid choice. Using MongoDB Memory Server.");
        mongoUri = "memory";
    }

    // Ask about seeding data
    const seedChoice = await askQuestion(
      "\nDo you want to seed initial demo data? (y/n): "
    );
    seedData = seedChoice.toLowerCase().startsWith("y") ? "true" : "false";

    // Generate JWT secret
    const jwtSecret = require("crypto").randomBytes(64).toString("hex");

    // Create .env content
    const envContent = `# Database Configuration
MONGODB_URI=${mongoUri}

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:3000

# Bcrypt Configuration
BCRYPT_ROUNDS=12

# Database Seeding
SEED_DATA=${seedData}
`;

    // Write .env file
    fs.writeFileSync(envPath, envContent);

    console.log("\n✅ Configuration saved to .env file");
    console.log("\n🎉 Setup complete! You can now start the server with:");
    console.log("npm start");

    if (seedData === "true") {
      console.log("\n👤 Demo credentials will be created:");
      console.log("Librarian: librarian@library.com / password123");
      console.log("Borrower: borrower@library.com / password123");
    }
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
  } finally {
    rl.close();
  }
}

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log("⚠️  .env file already exists.");
  askQuestion("Do you want to overwrite it? (y/n): ").then((answer) => {
    if (answer.toLowerCase().startsWith("y")) {
      setupMongoDB();
    } else {
      console.log("Setup cancelled.");
      rl.close();
    }
  });
} else {
  setupMongoDB();
}
