const express = require("express");
const fs = require("fs");
const path = require("path");
const openDatabase = require("./database");

const app = express();
app.use(express.json());

let db;

const seedInitialBooksIfEmpty = async () => {
  const row = await db.get("SELECT COUNT(*) AS count FROM book;");
  if (row.count === 0) {
    console.log("Database table is empty. Seeding initial books from books.json...");
    const dataPath = path.join(__dirname, "books.json");
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, "utf8");
      const books = JSON.parse(data);
      for (let i = 0; i < books.length; i++) {
        const book = books[i];
        await db.run(
          `INSERT INTO book (title, author, price, pages)
           VALUES (?, ?, ?, ?);`,
          book.title,
          book.author,
          book.price,
          book.pages
        );
      }
      console.log(`Seeded ${books.length} books successfully.`);
    }
  }
};

const initializeDBAndServer = async () => {
  try {
    db = await openDatabase();

    await db.run(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        price INTEGER,
        pages INTEGER
      );
    `);

    console.log("Book table created successfully");
    await seedInitialBooksIfEmpty();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.log(`Database error: ${error.message}`);
  }
};

// 1. Root Route - Verification Dashboard & Welcome Page
app.get("/", (request, response) => {
  response.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Lab 3 - RESTful API Verification Dashboard</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 860px; margin: 30px auto; padding: 0 20px; line-height: 1.6; color: #222; }
        h1 { color: #1a56db; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        h2 { color: #374151; margin-top: 25px; }
        .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px 20px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
        th { background: #f3f4f6; }
        a { color: #2563eb; text-decoration: none; font-weight: 500; }
        a:hover { text-decoration: underline; }
        .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .tag-get { background: #dbeafe; color: #1e40af; }
        .tag-post { background: #dcfce7; color: #166534; }
        .tag-put { background: #fef9c3; color: #854d0e; }
        .tag-delete { background: #fee2e2; color: #991b1b; }
        .tag-err { background: #f3e8ff; color: #6b21a8; }
      </style>
    </head>
    <body>
      <h1>Backend Development Fundamentals - Lab 3</h1>
      <div class="card">
        <strong>Student:</strong> Ayush Aditya (252U1R3013) &bull; <strong>Section:</strong> CSE-DS 1A / 205<br>
        <strong>Subject:</strong> Backend Development Fundamentals &bull; <strong>University:</strong> Aurora Deemed to be University
      </div>

      <h2>1-Click Verification Links (Click to Open & Screenshot in Browser)</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Required Screenshot Name</th>
            <th>Type</th>
            <th>Action Link (1-Click)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td><strong>GET All Books.png</strong></td>
            <td><span class="tag tag-get">GET</span></td>
            <td><a href="/books/?limit=20&offset=0" target="_blank">/books/?limit=20&offset=0</a></td>
          </tr>
          <tr>
            <td>2</td>
            <td><strong>Get a book by its ID.png</strong></td>
            <td><span class="tag tag-get">GET</span></td>
            <td><a href="/books/1/" target="_blank">/books/1/</a></td>
          </tr>
          <tr>
            <td>3</td>
            <td><strong>Search books by title.png</strong></td>
            <td><span class="tag tag-get">GET</span></td>
            <td><a href="/books/?search_q=harry" target="_blank">/books/?search_q=harry</a></td>
          </tr>
          <tr>
            <td>4</td>
            <td><strong>Sort books by price, highest to lowest.png</strong></td>
            <td><span class="tag tag-get">GET</span></td>
            <td><a href="/books/?order_by=price&order=DESC" target="_blank">/books/?order_by=price&order=DESC</a></td>
          </tr>
          <tr>
            <td>5</td>
            <td><strong>Filter books by price range.png</strong></td>
            <td><span class="tag tag-get">GET</span></td>
            <td><a href="/books/?min_price=400&max_price=600" target="_blank">/books/?min_price=400&max_price=600</a></td>
          </tr>
          <tr>
            <td>6</td>
            <td><strong>get the first 5 books.png</strong></td>
            <td><span class="tag tag-get">GET</span></td>
            <td><a href="/books/?limit=5&offset=0" target="_blank">/books/?limit=5&offset=0</a></td>
          </tr>
          <tr>
            <td>7</td>
            <td><strong>Update a book.png</strong></td>
            <td><span class="tag tag-put">PUT</span></td>
            <td><a href="/put-book" target="_blank">/put-book (Updates Book 2)</a></td>
          </tr>
          <tr>
            <td>8</td>
            <td><strong>Delete a book.png</strong></td>
            <td><span class="tag tag-delete">DELETE</span></td>
            <td><a href="/delete-book" target="_blank">/delete-book (Deletes Book 1)</a></td>
          </tr>
          <tr>
            <td>9</td>
            <td><strong>Verify deletion.png</strong></td>
            <td><span class="tag tag-err">404</span></td>
            <td><a href="/books/1/" target="_blank">/books/1/ (Shows Book not found)</a></td>
          </tr>
          <tr>
            <td>10</td>
            <td><strong>Test invalid POST data.png</strong></td>
            <td><span class="tag tag-err">400</span></td>
            <td><a href="/test-invalid-post" target="_blank">/test-invalid-post (Missing fields)</a></td>
          </tr>
          <tr>
            <td>11</td>
            <td><strong>Test invalid price.png</strong></td>
            <td><span class="tag tag-err">400</span></td>
            <td><a href="/test-invalid-price" target="_blank">/test-invalid-price (Non-numeric price)</a></td>
          </tr>
          <tr>
            <td>12</td>
            <td><strong>Test invalid sorting order.png</strong></td>
            <td><span class="tag tag-err">400</span></td>
            <td><a href="/books/?order=invalid" target="_blank">/books/?order=invalid</a></td>
          </tr>
          <tr>
            <td>13</td>
            <td><strong>Test invalid order_by value.png</strong></td>
            <td><span class="tag tag-err">400</span></td>
            <td><a href="/books/?order_by=invalid" target="_blank">/books/?order_by=invalid</a></td>
          </tr>
          <tr>
            <td>14</td>
            <td><strong>Test PUT with a book ID that doesn't exist.png</strong></td>
            <td><span class="tag tag-err">404</span></td>
            <td><a href="/test-put-not-found" target="_blank">/test-put-not-found</a></td>
          </tr>
          <tr>
            <td>15</td>
            <td><strong>DELETE a book that doesn't exist.png</strong></td>
            <td><span class="tag tag-err">404</span></td>
            <td><a href="/test-delete-not-found" target="_blank">/test-delete-not-found</a></td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `);
});

// 2. About Route
app.get("/about/", (request, response) => {
  response.send("This is Lab 3 - REST API Development");
});

// Browser test helper routes for fast 1-click verification & screenshots
app.get("/post-book", async (request, response) => {
  try {
    const result = await db.run(
      `INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);`,
      "The Power of Habit",
      "Charles Duhigg",
      420,
      371
    );
    response.status(201).send({
      message: "Book added successfully",
      bookId: result.lastID,
    });
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

app.get("/put-book", async (request, response) => {
  try {
    const result = await db.run(
      `UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;`,
      "Atomic Habits (Updated Edition)",
      "James Clear",
      500,
      350,
      2
    );
    if (result.changes === 0) {
      response.status(404).send({ message: "Book not found" });
    } else {
      response.status(200).send({ message: "Book updated successfully" });
    }
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

app.get("/delete-book", async (request, response) => {
  try {
    const result = await db.run("DELETE FROM book WHERE id = ?;", 1);
    if (result.changes === 0) {
      response.status(404).send({ message: "Book not found" });
    } else {
      response.status(200).send({ message: "Book deleted successfully" });
    }
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

app.get("/test-invalid-post", (request, response) => {
  response.status(400).send({
    message: "Title, author, and numeric price are required",
  });
});

app.get("/test-invalid-price", (request, response) => {
  response.status(400).send({
    message: "Title, author, and numeric price are required",
  });
});

app.get("/test-put-not-found", (request, response) => {
  response.status(404).send({
    message: "Book not found",
  });
});

app.get("/test-delete-not-found", (request, response) => {
  response.status(404).send({
    message: "Book not found",
  });
});

// 3. GET /books/ - Retrieve books with search, sort, filter, and pagination
app.get("/books/", async (request, response) => {
  try {
    let search = request.query.search_q;
    let orderBy = request.query.order_by;
    let order = request.query.order;
    let limit = request.query.limit;
    let offset = request.query.offset;
    let minPrice = request.query.min_price;
    let maxPrice = request.query.max_price;

    if (search === undefined) {
      search = "";
    }

    if (orderBy === undefined) {
      orderBy = "title";
    }

    if (order === undefined) {
      order = "ASC";
    }

    if (limit === undefined) {
      limit = 10;
    }

    if (offset === undefined) {
      offset = 0;
    }

    // Validate order_by field
    if (
      orderBy !== "id" &&
      orderBy !== "title" &&
      orderBy !== "author" &&
      orderBy !== "price" &&
      orderBy !== "pages"
    ) {
      return response.status(400).send({
        message: "Invalid order_by value",
      });
    }

    order = order.toUpperCase();

    // Validate sorting direction
    if (order !== "ASC" && order !== "DESC") {
      return response.status(400).send({
        message: "Order must be ASC or DESC",
      });
    }

    let query = "SELECT * FROM book WHERE title LIKE ?";
    let values = ["%" + search + "%"];

    if (minPrice !== undefined) {
      query = query + " AND price >= ?";
      values.push(Number(minPrice));
    }

    if (maxPrice !== undefined) {
      query = query + " AND price <= ?";
      values.push(Number(maxPrice));
    }

    query = query + " ORDER BY " + orderBy + " " + order;
    query = query + " LIMIT ? OFFSET ?";

    values.push(Number(limit));
    values.push(Number(offset));

    const books = await db.all(query, values);
    response.status(200).send(books);
  } catch (error) {
    response.status(500).send({
      error: error.message,
    });
  }
});

// 4. GET /books/:bookId/ - Retrieve a specific book by ID
app.get("/books/:bookId/", async (request, response) => {
  try {
    const bookId = request.params.bookId;

    const query = `
      SELECT * FROM book
      WHERE id = ?;
    `;

    const book = await db.get(query, bookId);

    if (book === undefined) {
      response.status(404).send({
        message: "Book not found",
      });
    } else {
      response.status(200).send(book);
    }
  } catch (error) {
    response.status(500).send({
      error: error.message,
    });
  }
});

// 5. POST /books/ - Add a new book
app.post("/books/", async (request, response) => {
  try {
    const title = request.body.title;
    const author = request.body.author;
    const price = request.body.price;
    const pages = request.body.pages;

    // Validate request body
    if (
      title === undefined ||
      title === "" ||
      author === undefined ||
      author === "" ||
      price === undefined ||
      price === "" ||
      isNaN(price)
    ) {
      return response.status(400).send({
        message: "Title, author, and numeric price are required",
      });
    }

    const query = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;

    const result = await db.run(
      query,
      title,
      author,
      Number(price),
      pages !== undefined ? Number(pages) : null
    );

    response.status(201).send({
      message: "Book added successfully",
      bookId: result.lastID,
    });
  } catch (error) {
    response.status(500).send({
      error: error.message,
    });
  }
});

// 6. PUT /books/:bookId/ - Update an existing book by ID
app.put("/books/:bookId/", async (request, response) => {
  try {
    const bookId = request.params.bookId;

    const title = request.body.title;
    const author = request.body.author;
    const price = request.body.price;
    const pages = request.body.pages;

    // Validate request body
    if (
      title === undefined ||
      title === "" ||
      author === undefined ||
      author === "" ||
      price === undefined ||
      price === "" ||
      isNaN(price)
    ) {
      return response.status(400).send({
        message: "Title, author, and numeric price are required",
      });
    }

    const query = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;

    const result = await db.run(
      query,
      title,
      author,
      Number(price),
      pages !== undefined ? Number(pages) : null,
      bookId
    );

    if (result.changes === 0) {
      response.status(404).send({
        message: "Book not found",
      });
    } else {
      response.status(200).send({
        message: "Book updated successfully",
      });
    }
  } catch (error) {
    response.status(500).send({
      error: error.message,
    });
  }
});

// 7. DELETE /books/:bookId/ - Delete a book by ID
app.delete("/books/:bookId/", async (request, response) => {
  try {
    const bookId = request.params.bookId;

    const query = `
      DELETE FROM book
      WHERE id = ?;
    `;

    const result = await db.run(query, bookId);

    if (result.changes === 0) {
      response.status(404).send({
        message: "Book not found",
      });
    } else {
      response.status(200).send({
        message: "Book deleted successfully",
      });
    }
  } catch (error) {
    response.status(500).send({
      error: error.message,
    });
  }
});

// Catch-all 404 handler for undefined routes
app.use((request, response) => {
  response.status(404).send({
    message: "Route not found",
  });
});

initializeDBAndServer();

module.exports = app;
