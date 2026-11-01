const express = require('express');
const openDatabase = require('./database');

const app = express();
app.use(express.json());

let db;

const initializeDBAndServer = async () => {
  try {
    db = await openDatabase();

    // Create table if not exists
    await db.run(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        price INTEGER,
        pages INTEGER
      );
    `);
    console.log('Book table verified/created successfully');

    // Populate initial sample records if the table is empty
    const bookCount = await db.get('SELECT COUNT(*) AS count FROM book;');
    if (bookCount.count === 0) {
      console.log('Seeding initial sample book records...');
      const sampleBooks = [
        ['Atomic Habits', 'James Clear', 450, 320],
        ['The Alchemist', 'Paulo Coelho', 300, 208],
        ['Rich Dad Poor Dad', 'Robert Kiyosaki', 350, 336],
        ['Deep Work', 'Cal Newport', 400, 296],
        ['Ikigai', 'Hector Garcia', 280, 194],
        ['Think Like a Monk', 'Jay Shetty', 380, 352],
        ['The Psychology of Money', 'Morgan Housel', 320, 256],
        ['Wings of Fire', 'A.P.J. Abdul Kalam', 250, 180],
      ];

      for (const book of sampleBooks) {
        await db.run(
          `INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);`,
          book
        );
      }
      console.log('Sample books seeded successfully');
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(`Database initialization error: ${error.message}`);
    process.exit(1);
  }
};

// 1. Home / Documentation Route
app.get('/', (request, response) => {
  response.send(`
    <h1>Welcome to Backend Fundamentals - Lab 2</h1>

    <p>
      This project demonstrates connecting an Express.js
      application with an SQLite database and performing
      CRUD operations on book records.
    </p>

    <h2>Available API Endpoints</h2>

    <h3>GET /books/</h3>
    <p>Retrieve all books from the database.</p>

    <h3>GET /books/:bookId/</h3>
    <p>Retrieve a specific book using its ID.</p>

    <h3>POST /books/</h3>
    <p>Add a new book to the database.</p>

    <h3>PUT /books/:bookId/</h3>
    <p>Update an existing book using its ID.</p>

    <h3>DELETE /books/:bookId/</h3>
    <p>Delete a book using its ID.</p>

    <p>Server Status: Running</p>
  `);
});

// Browser test helper routes for fast 1-click verification & screenshots
const handlePostBook = async (request, response) => {
  try {
    const result = await db.run(
      `INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);`,
      'The Power of Habit',
      'Charles Duhigg',
      420,
      371
    );
    response.status(200).send({
      message: 'Book added successfully',
      bookId: result.lastID,
    });
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
};

const handlePutBook = async (request, response) => {
  try {
    await db.run(
      `UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;`,
      'Atomic Habits (Updated Edition)',
      'James Clear',
      499,
      320,
      1
    );
    response.status(200).send({ message: 'Book updated successfully' });
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
};

const handleDeleteBook = async (request, response) => {
  try {
    await db.run(`DELETE FROM book WHERE id = ?;`, 8);
    response.status(200).send({ message: 'Book deleted successfully' });
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
};

app.get('/post-book', handlePostBook);
app.get('/books/post', handlePostBook);
app.get('/put-book', handlePutBook);
app.get('/books/put', handlePutBook);
app.get('/delete-book', handleDeleteBook);
app.get('/books/delete', handleDeleteBook);

// 2. GET /books/ - Retrieve all books
app.get('/books/', async (request, response) => {
  try {
    const getBooksQuery = `SELECT * FROM book;`;
    const books = await db.all(getBooksQuery);
    response.status(200).send(books);
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// 3. GET /books/:bookId/ - Retrieve a specific book by ID
app.get('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params;
    const getBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const book = await db.get(getBookQuery, bookId);

    if (book === undefined) {
      response.status(404).send({ message: 'Book not found' });
    } else {
      response.status(200).send(book);
    }
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// 4. POST /books/ - Add a new book
app.post('/books/', async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;
    const addBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;

    const result = await db.run(addBookQuery, title, author, price, pages);
    response.status(201).send({
      message: 'Book added successfully',
      bookId: result.lastID,
    });
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// 5. PUT /books/:bookId/ - Update an existing book by ID
app.put('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    const updateBookQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;

    const result = await db.run(
      updateBookQuery,
      title,
      author,
      price,
      pages,
      bookId
    );

    if (result.changes === 0) {
      response.status(404).send({ message: 'Book not found' });
    } else {
      response.status(200).send({ message: 'Book updated successfully' });
    }
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// 6. DELETE /books/:bookId/ - Delete a book by ID
app.delete('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params;
    const deleteBookQuery = `DELETE FROM book WHERE id = ?;`;

    const result = await db.run(deleteBookQuery, bookId);

    if (result.changes === 0) {
      response.status(404).send({ message: 'Book not found' });
    } else {
      response.status(200).send({ message: 'Book deleted successfully' });
    }
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// Catch-all 404 handler for undefined routes
app.use((request, response) => {
  response.status(404).send({ message: 'Route not found' });
});

// Initialize database and start the server
initializeDBAndServer();

module.exports = app;
