const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
return username && typeof username === "string";
}

const authenticatedUser = (username, password) => {
  // Check if user exists in the users array with matching password
  return users.some((user) => user.username === username && user.password === password);
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Create JWT token
    const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });

    // Save to session
    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "Login successful" });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// Add a book review
// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization?.username;

  // Check if the user is logged in
  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  // Validate input
  if (!review) {
    return res.status(400).json({ message: "Review content is required." });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Initialize reviews object if missing
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update review under the logged-in username
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added or updated successfully." });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  // Check if the user is logged in
  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Check if the review exists for this user
  const userReviews = books[isbn].reviews;
  if (userReviews && userReviews[username]) {
    delete userReviews[username];  // Delete the user's review
    return res.status(200).json({ message: "Review deleted successfully." });
  } else {
    return res.status(404).json({ message: "No review found for this user." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
