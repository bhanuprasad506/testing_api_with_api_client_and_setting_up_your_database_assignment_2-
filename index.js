const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('static'));

const DATA_FILE = path.join(__dirname, 'data.json');

// Helper function to read data
function readBooks() {
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}

// Helper function to write data
function writeBooks(books) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2));
}

// CREATE a new book
app.post('/books', (req, res) => {
  const { book_id, title, author, genre, year, copies } = req.body;
  if (!book_id || !title || !author || !genre || !Number.isInteger(year) || !Number.isInteger(copies)) {
    return res.status(400).json({ error: 'Invalid input. Please provide all required fields with valid types.' });
  }

  const books = readBooks();
  if (books.find(book => book.book_id == book_id)) {
    return res.status(409).json({ error: 'Book with this ID already exists.' });
  }

  const newBook = { book_id, title, author, genre, year, copies };
  books.push(newBook);
  writeBooks(books);
  res.status(201).json(newBook);
});

// READ all books
app.get('/books', (req, res) => {
  const books = readBooks();
  res.json(books);
});

// READ book by ID
app.get('/books/:id', (req, res) => {
  const books = readBooks();
  const book = books.find(b => b.book_id == req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found.' });
  res.json(book);
});

// UPDATE book by ID
app.put('/books/:id', (req, res) => {
  const books = readBooks();
  const book = books.find(b => b.book_id == req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found.' });

  const { title, author, genre, year, copies } = req.body;

  if (year !== undefined && !Number.isInteger(year)) return res.status(400).json({ error: 'Year must be an integer.' });
  if (copies !== undefined && !Number.isInteger(copies)) return res.status(400).json({ error: 'Copies must be an integer.' });

  if (title) book.title = title;
  if (author) book.author = author;
  if (genre) book.genre = genre;
  if (year !== undefined) book.year = year;
  if (copies !== undefined) book.copies = copies;

  writeBooks(books);
  res.json(book);
});

// DELETE book by ID
app.delete('/books/:id', (req, res) => {
  let books = readBooks();
  const index = books.findIndex(b => b.book_id == req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Book not found.' });

  books.splice(index, 1);
  writeBooks(books);
  res.json({ message: 'Book deleted successfully.' });
});

app.listen(PORT, () => {
  console.log(`Library API running at http://localhost:${PORT}`);
});
