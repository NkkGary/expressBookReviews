const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');

const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    const userExists = users.some((user) => user.username === username);
    if (userExists) {
      return res.status(409).json({ message: "User already exists" });
    }
  
    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
  });

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Return all books as a formatted JSON string
    return res.status(200).send(JSON.stringify(books, null, 4));
  });

  // Get book list using async/await and Axios
public_users.get('/async-books', async (req, res) => {
    try {
      const response = await axios.get('http://localhost:5000/');
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
  });


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;        // Get ISBN from URL
    const book = books[isbn];            // Find book by ISBN
  
    if (book) {
      res.status(200).json(book);        // Return book details if found
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  });
// Get book details by ISBN using async/await and Axios
public_users.get('/async-isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
  
    try {
      const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(404).json({ message: "Book not found", error: error.message });
    }
  });
  

  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;         // Get author from URL
    const keys = Object.keys(books);          // Get all book keys
    const filteredBooks = [];                 // Prepare array for results
  
    // Iterate and find matching authors
    keys.forEach((key) => {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        filteredBooks.push({ isbn: key, ...books[key] });
      }
    });
  
    if (filteredBooks.length > 0) {
      res.status(200).json(filteredBooks);
    } else {
      res.status(404).json({ message: "No books found for this author" });
    }
  });

  // Get book details by author using async/await and Axios
public_users.get('/async-author/:author', async (req, res) => {
    const author = req.params.author;
  
    try {
      const response = await axios.get(`http://localhost:5000/author/${author}`);
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(404).json({ message: "Author not found", error: error.message });
    }
  });
  
  

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();   // Get title from URL and normalize
    const keys = Object.keys(books);                // Get all ISBN keys
    const matchingBooks = [];                       // Array to hold matching results
  
    keys.forEach((key) => {
      if (books[key].title.toLowerCase() === title) {
        matchingBooks.push({ isbn: key, ...books[key] });
      }
    });
  
    if (matchingBooks.length > 0) {
      res.status(200).json(matchingBooks);
    } else {
      res.status(404).json({ message: "No books found with that title" });
    }
  });

  // Get book details by title using async/await and Axios
public_users.get('/async-title/:title', async (req, res) => {
    const title = req.params.title;
  
    try {
      const response = await axios.get(`http://localhost:5000/title/${title}`);
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(404).json({ message: "Title not found", error: error.message });
    }
  });
  
  

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;           // Get ISBN from URL
    const book = books[isbn];               // Find the book by ISBN
  
    if (book) {
      res.status(200).json(book.reviews);   // Return the reviews object
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  });
  

module.exports.general = public_users;
