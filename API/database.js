const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'books.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            year INTEGER NOT NULL,
            genre TEXT NOT NULL,
            rating REAL NOT NULL,
            image TEXT NOT NULL
        )
    `);

    db.get("SELECT COUNT(*) AS count FROM books", (err, row) => {
        if (err) {
            console.error("Error checking records:", err.message);
            return;
        }

        if (row.count === 0) {
            const stmt = db.prepare(`
                INSERT INTO books (title, author, year, genre, rating, image)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            const sampleBooks = [
                ["Atomic Habits", "James Clear", 2018, "Self-help", 4.8, "https://covers.openlibrary.org/b/id/10523338-L.jpg"],
                ["The Alchemist", "Paulo Coelho", 1988, "Fiction", 4.5, "https://covers.openlibrary.org/b/id/8231856-L.jpg"],
                ["Clean Code", "Robert C. Martin", 2008, "Programming", 4.7, "https://covers.openlibrary.org/b/id/9612325-L.jpg"],
                ["Deep Work", "Cal Newport", 2016, "Productivity", 4.6, "https://covers.openlibrary.org/b/id/10594841-L.jpg"],
                ["Rich Dad Poor Dad", "Robert Kiyosaki", 1997, "Finance", 4.4, "https://covers.openlibrary.org/b/id/240726-L.jpg"],
                ["The Pragmatic Programmer", "Andrew Hunt", 1999, "Programming", 4.8, "https://covers.openlibrary.org/b/id/8097440-L.jpg"],
                ["Zero to One", "Peter Thiel", 2014, "Business", 4.3, "https://covers.openlibrary.org/b/id/8522228-L.jpg"],
                ["Think and Grow Rich", "Napoleon Hill", 1937, "Motivation", 4.2, "https://covers.openlibrary.org/b/id/12687815-L.jpg"],
                ["The Psychology of Money", "Morgan Housel", 2020, "Finance", 4.9, "https://covers.openlibrary.org/b/id/10512818-L.jpg"],
                ["Can't Hurt Me", "David Goggins", 2018, "Biography", 4.7, "https://covers.openlibrary.org/b/id/9251996-L.jpg"],
                ["Ikigai", "Héctor García", 2016, "Lifestyle", 4.4, "https://covers.openlibrary.org/b/id/8370226-L.jpg"],
                ["Start With Why", "Simon Sinek", 2009, "Leadership", 4.5, "https://covers.openlibrary.org/b/id/6363341-L.jpg"],
                ["The Lean Startup", "Eric Ries", 2011, "Business", 4.4, "https://covers.openlibrary.org/b/id/6979861-L.jpg"],
                ["The 4-Hour Workweek", "Tim Ferriss", 2007, "Lifestyle", 4.1, "https://covers.openlibrary.org/b/id/5546156-L.jpg"],
                ["Do Epic Shit", "Ankur Warikoo", 2021, "Motivation", 4.0, "https://covers.openlibrary.org/b/id/12726968-L.jpg"],
                ["Ego Is the Enemy", "Ryan Holiday", 2016, "Philosophy", 4.3, "https://covers.openlibrary.org/b/id/8375110-L.jpg"],
                ["The Power of Now", "Eckhart Tolle", 1997, "Spirituality", 4.2, "https://covers.openlibrary.org/b/id/8231990-L.jpg"],
                ["Hooked", "Nir Eyal", 2014, "Business", 4.1, "https://covers.openlibrary.org/b/id/10121237-L.jpg"],
                ["Rework", "Jason Fried", 2010, "Business", 4.0, "https://covers.openlibrary.org/b/id/6363346-L.jpg"],
                ["The Mountain Is You", "Brianna Wiest", 2020, "Self-help", 4.6, "https://covers.openlibrary.org/b/id/12687914-L.jpg"]
            ];

            sampleBooks.forEach(book => stmt.run(book));
            stmt.finalize();

            console.log("20 sample books inserted successfully.");
        }
    });
});

module.exports = db;