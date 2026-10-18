const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: register
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.some((u) => u.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 1: get all books
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: by ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4));
  }
  return res.status(404).json({ message: "Book not found" });
});

// Task 3: by author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const result = Object.keys(books)
    .filter((k) => books[k].author.toLowerCase() === author)
    .map((k) => ({ isbn: k, ...books[k] }));

  if (result.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbyauthor: result }, null, 4));
  }
  return res.status(404).json({ message: "No books found for this author" });
});

// Task 4: by title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const result = Object.keys(books)
    .filter((k) => books[k].title.toLowerCase() === title)
    .map((k) => ({ isbn: k, ...books[k] }));

  if (result.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbytitle: result }, null, 4));
  }
  return res.status(404).json({ message: "No books found with this title" });
});

// Task 5: get reviews
public_users.get('/review/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  }
  return res.status(404).json({ message: "Book not found" });
});

// Task 10: Axios with async/await
const BASE_URL = "http://localhost:5000";

const getAllBooks = async () => {
  const response = await axios.get(`${BASE_URL}/`);
  return response.data;
};

const getBookByISBN = async (isbn) => {
  const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
  return response.data;
};

const getBooksByAuthor = async (author) => {
  const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
};

const getBooksByTitle = async (title) => {
  const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
  return response.data;
};

public_users.get('/async/books', async (req, res) => {
  try {
    return res.status(200).send(JSON.stringify(await getAllBooks(), null, 4));
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
    return res.status(200).send(JSON.stringify(await getBookByISBN(req.params.isbn), null, 4));
  } catch (err) {
    return res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/async/author/:author', async (req, res) => {
  try {
    return res.status(200).send(JSON.stringify(await getBooksByAuthor(req.params.author), null, 4));
  } catch (err) {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

public_users.get('/async/title/:title', async (req, res) => {
  try {
    return res.status(200).send(JSON.stringify(await getBooksByTitle(req.params.title), null, 4));
  } catch (err) {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

module.exports.general = public_users;