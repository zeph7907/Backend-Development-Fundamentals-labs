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
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Backend Development Fundamentals - Lab 2</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 40px; background-color: #f8fafc; color: #1e293b; line-height: 1.6; }
        .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); max-width: 800px; margin: 0 auto; }
        h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0; }
        h2 { color: #2563eb; margin-top: 24px; }
        .student-info { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
        th { background-color: #f1f5f9; color: #475569; font-weight: 600; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .get { background-color: #dbeafe; color: #1d4ed8; }
        .post { background-color: #dcfce7; color: #15803d; }
        .put { background-color: #fef3c7; color: #b45309; }
        .delete { background-color: #fee2e2; color: #b91c1c; }
        code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
        .status { margin-top: 25px; padding: 10px 15px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 6px 6px 0; color: #065f46; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Backend Development Fundamentals – Lab 2</h1>
        <div class="student-info">
          <p><strong>Student Name:</strong> Ayush Aditya</p>
          <p><strong>Registration Number:</strong> 252U1R3013</p>
          <p><strong>Class & Section:</strong> CSE-DS 1A / 205</p>
          <p><strong>University:</strong> Aurora Deemed to be University</p>
        </div>
        <p>This Express.js application connects to an <strong>SQLite</strong> database (<code>books.db</code>) and implements full CRUD operations with parameterized SQL queries.</p>
        
        <h2>Available API Endpoints</h2>
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th>Endpoint</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="badge get">GET</span></td>
              <td><code>/books/</code></td>
              <td>Retrieve all books from the database</td>
            </tr>
            <tr>
              <td><span class="badge get">GET</span></td>
              <td><code>/books/:bookId/</code></td>
              <td>Retrieve a specific book by ID</td>
            </tr>
            <tr>
              <td><span class="badge post">POST</span></td>
              <td><code>/books/</code></td>
              <td>Add a new book record</td>
            </tr>
            <tr>
              <td><span class="badge put">PUT</span></td>
              <td><code>/books/:bookId/</code></td>
              <td>Update an existing book by ID</td>
            </tr>
            <tr>
              <td><span class="badge delete">DELETE</span></td>
              <td><code>/books/:bookId/</code></td>
              <td>Delete a book record by ID</td>
            </tr>
          </tbody>
        </table>

        <div class="status">
          Server Status: Running & Connected to SQLite Database
        </div>
      </div>
    </body>
    </html>
  `);
});

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
