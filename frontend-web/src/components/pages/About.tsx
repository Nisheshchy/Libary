/** @format */

import React from "react";
import "./Pages.css";

const About = () => {
  return (
    <div className="page">
      <div className="page-container">
        <div className="page-header">
          <h1>About Our Library</h1>
          <p>Discover the story behind our digital library management system</p>
        </div>

        <div className="page-content">
          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              We are dedicated to providing a modern, efficient, and
              user-friendly library management system that connects readers with
              books and knowledge. Our platform bridges the gap between
              traditional library services and digital convenience, making it
              easier than ever to discover, borrow, and manage books.
            </p>
          </section>

          <section className="about-section">
            <h2>What We Offer</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📚</div>
                <h3>Extensive Collection</h3>
                <p>
                  Access thousands of books across various genres, from classic
                  literature to modern bestsellers.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>Smart Search</h3>
                <p>
                  Find books quickly with our advanced search functionality by
                  title, author, genre, or ISBN.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>Digital Management</h3>
                <p>
                  Manage your borrowings, track due dates, and renew books all
                  from your digital dashboard.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3>Community Focused</h3>
                <p>
                  Built for both individual readers and library administrators
                  with role-based access.
                </p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>For Readers</h2>
            <p>
              As a borrower, you can browse our extensive collection, search for
              specific titles or authors, borrow books with just a click, and
              keep track of your reading history. Our system makes it easy to
              discover new books and manage your current borrowings.
            </p>
            <ul className="feature-list">
              <li>Browse and search our book collection</li>
              <li>Borrow books instantly (subject to availability)</li>
              <li>Track your borrowing history</li>
              <li>Manage due dates and returns</li>
              <li>Discover new books and authors</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>For Librarians</h2>
            <p>
              Library administrators have full control over the collection and
              can efficiently manage books, track borrowings, and maintain the
              library's inventory. Our admin tools are designed to streamline
              library operations.
            </p>
            <ul className="feature-list">
              <li>Add, edit, and remove books from the collection</li>
              <li>Monitor all borrowing activities</li>
              <li>Track book availability and inventory</li>
              <li>Generate reports and statistics</li>
              <li>Manage user accounts and permissions</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Technology</h2>
            <p>
              Our platform is built using modern web technologies to ensure
              reliability, security, and performance. We use industry-standard
              practices for data protection and user authentication.
            </p>
            <div className="tech-stack">
              <div className="tech-item">
                <strong>Frontend:</strong> React with TypeScript
              </div>
              <div className="tech-item">
                <strong>Backend:</strong> Node.js with Express
              </div>
              <div className="tech-item">
                <strong>Database:</strong> MongoDB
              </div>
              <div className="tech-item">
                <strong>Security:</strong> JWT Authentication & bcrypt
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Get Started</h2>
            <p>
              Ready to start your reading journey? Create an account to begin
              browsing our collection and borrowing books. Whether you're a
              casual reader or a book enthusiast, our library has something for
              everyone.
            </p>
            <div className="cta-buttons">
              <a href="/register" className="btn btn-primary">
                Join Our Library
              </a>
              <a href="/books" className="btn btn-secondary">
                Browse Books
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
