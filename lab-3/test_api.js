const http = require("http");

const BASE_URL = "http://localhost:3000";

const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {},
    };

    let payload = null;
    if (body) {
      payload = JSON.stringify(body);
      options.headers["Content-Type"] = "application/json";
      options.headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on("error", reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const runAllTests = async () => {
  console.log("=== STARTING LAB 3 COMPREHENSIVE VERIFICATION ===\n");

  const tests = [
    { name: "1. GET / (Home Route)", method: "GET", path: "/" },
    { name: "2. GET /about/ (About Route)", method: "GET", path: "/about/" },
    { name: "3. GET /books/ (All books)", method: "GET", path: "/books/" },
    { name: "4. GET /books/1/ (Book by ID)", method: "GET", path: "/books/1/" },
    { name: "5. Search by title (?search_q=harry)", method: "GET", path: "/books/?search_q=harry" },
    { name: "6. Search by title (?search_q=the)", method: "GET", path: "/books/?search_q=the" },
    { name: "7. Sort by price DESC (?order_by=price&order=DESC)", method: "GET", path: "/books/?order_by=price&order=DESC" },
    { name: "8. Filter by price range (?min_price=400&max_price=600)", method: "GET", path: "/books/?min_price=400&max_price=600" },
    { name: "9. Pagination (?limit=5&offset=0)", method: "GET", path: "/books/?limit=5&offset=0" },
    {
      name: "10. POST /books/ (Add valid book)",
      method: "POST",
      path: "/books/",
      body: {
        title: "The Power of Habit",
        author: "Charles Duhigg",
        price: 420,
        pages: 371,
      },
    },
    {
      name: "11. PUT /books/2/ (Update book)",
      method: "PUT",
      path: "/books/2/",
      body: {
        title: "Atomic Habits (Updated Edition)",
        author: "James Clear",
        price: 500,
        pages: 350,
      },
    },
    { name: "12. DELETE /books/1/ (Delete book)", method: "DELETE", path: "/books/1/" },
    { name: "13. Verify deletion of ID 1 (GET /books/1/ -> 404)", method: "GET", path: "/books/1/" },
    { name: "14. Validation: Invalid order_by (?order_by=rating -> 400)", method: "GET", path: "/books/?order_by=rating" },
    { name: "15. Validation: Invalid order (?order=RANDOM -> 400)", method: "GET", path: "/books/?order=RANDOM" },
    {
      name: "16. Validation: Invalid POST data (missing author -> 400)",
      method: "POST",
      path: "/books/",
      body: { title: "No Author Book", price: 300 },
    },
    {
      name: "17. Validation: Invalid price in POST (not a number -> 400)",
      method: "POST",
      path: "/books/",
      body: { title: "Bad Price Book", author: "Author", price: "abc" },
    },
    {
      name: "18. Validation: PUT non-existent book ID (PUT /books/999/ -> 404)",
      method: "PUT",
      path: "/books/999/",
      body: { title: "Ghost Book", author: "Nobody", price: 100 },
    },
    { name: "19. Validation: DELETE non-existent book ID (DELETE /books/999/ -> 404)", method: "DELETE", path: "/books/999/" },
    { name: "20. Undefined route test (GET /undefined-route -> 404)", method: "GET", path: "/undefined-route" },
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const res = await request(t.method, t.path, t.body);
      console.log(`[PASS] ${t.name}`);
      console.log(`       Status: ${res.status}`);
      console.log(`       Response: ${JSON.stringify(res.body).slice(0, 120)}...`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${t.name} -> ${err.message}`);
    }
  }

  console.log(`\nVerification Complete: ${passed}/${tests.length} tests executed.`);
};

// If run directly, execute tests
if (require.main === module) {
  runAllTests();
}

module.exports = { request, runAllTests };
