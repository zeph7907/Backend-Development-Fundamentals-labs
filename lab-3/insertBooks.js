const openDatabase = require("./database");
const fs = require("fs");
const path = require("path");

const insertBooks = async () => {
  try {
    const db = await openDatabase();

    await db.run(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        price INTEGER,
        pages INTEGER
      );
    `);

    // Reset table data
    await db.run("DELETE FROM book;");
    await db.run("DELETE FROM sqlite_sequence WHERE name = 'book';");

    const dataPath = path.join(__dirname, "books.json");
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

    console.log(`All ${books.length} books added successfully`);
    await db.close();
  } catch (error) {
    console.error(`Error inserting books: ${error.message}`);
  }
};

insertBooks();
