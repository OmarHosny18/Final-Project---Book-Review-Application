const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "Registration successful, Now you can login" });
    } else {
      return res.status(400).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.send(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const bookList = Object.values(books).filter(
    (book) => book.author === author
  );
  if (bookList.length > 0) {
    res.send(bookList);
  } else {
    res.status(404).json({ message: "Author not found" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const bookList = Object.values(books).filter((book) => book.title === title);
  if (bookList.length > 0) {
    res.send(bookList);
  } else {
    res.status(404).json({ message: "Title not found" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.send(book.reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

public_users.get("/async/books", async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000/");
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
});

public_users.get("/promise/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  axios
    .get(`http://localhost:5000/isbn/${isbn}`)
    .then((response) => {
      res.status(200).json(response.data);
    })
    .catch((error) => {
      if (error.response && error.response.status === 404) {
        res.status(404).json({ message: "Book not found" });
      } else {
        res.status(500).json({
          message: "Error fetching book by ISBN",
          error: error.message,
        });
      }
    });
});

public_users.get("/async/author/:author", async function (req, res) {
  const author = req.params.author;

  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: "Author not found" });
    } else {
      res.status(500).json({
        message: "Error fetching books by author",
        error: error.message,
      });
    }
  }
});

public_users.get("/async/title/:title", async function (req, res) {
  const title = req.params.title;

  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: "Title not found" });
    } else {
      res.status(500).json({
        message: "Error fetching books by title",
        error: error.message,
      });
    }
  }
});

module.exports.general = public_users;
