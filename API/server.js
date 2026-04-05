const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

function isValidImageUrl(url) {
    return typeof url === 'string' && url.trim().length > 5;
}

/**
 * @api {get} / API status
 * @apiName GetApiStatus
 * @apiGroup General
 * @apiDescription Checks whether the Book Library API server is running.
 *
 * @apiSuccess {String} message API status message.
 *
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
 * {
 *   "message": "Book Library API is running successfully"
 * }
 */
app.get('/', (req, res) => {
    res.json({ message: 'Book Library API is running successfully' });
});

/**
 * @api {get} /books Get all books
 * @apiName GetAllBooks
 * @apiGroup Books
 * @apiDescription Returns all books or searches books by title, author, or genre.
 *
 * @apiQuery {String} [search] Optional search keyword.
 *
 * @apiSuccess {Object[]} books List of books.
 * @apiSuccess {Number} books.id Book ID.
 * @apiSuccess {String} books.title Book title.
 * @apiSuccess {String} books.author Book author.
 * @apiSuccess {Number} books.year Publication year.
 * @apiSuccess {String} books.genre Book genre.
 * @apiSuccess {Number} books.rating Book rating.
 * @apiSuccess {String} books.image Book cover image URL.
 *
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
 * [
 *   {
 *     "id": 1,
 *     "title": "Atomic Habits",
 *     "author": "James Clear",
 *     "year": 2018,
 *     "genre": "Self-help",
 *     "rating": 4.8,
 *     "image": "https://example.com/book.jpg"
 *   }
 * ]
 *
 * @apiErrorExample {json} Error Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "error": "Failed to fetch books"
 * }
 */
app.get('/books', (req, res) => {
    const search = req.query.search ? req.query.search.trim() : '';

    if (search) {
        const sql = `
            SELECT * FROM books
            WHERE title LIKE ? OR author LIKE ? OR genre LIKE ?
            ORDER BY id DESC
        `;
        const searchValue = `%${search}%`;

        db.all(sql, [searchValue, searchValue, searchValue], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to search books' });
            }
            res.status(200).json(rows);
        });
    } else {
        db.all('SELECT * FROM books ORDER BY id DESC', [], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch books' });
            }
            res.status(200).json(rows);
        });
    }
});

/**
 * @api {get} /books/:id Get single book
 * @apiName GetBookById
 * @apiGroup Books
 * @apiDescription Returns one book by ID.
 *
 * @apiParam {Number} id Book unique ID.
 *
 * @apiSuccess {Number} id Book ID.
 * @apiSuccess {String} title Book title.
 * @apiSuccess {String} author Book author.
 * @apiSuccess {Number} year Publication year.
 * @apiSuccess {String} genre Book genre.
 * @apiSuccess {Number} rating Book rating.
 * @apiSuccess {String} image Book cover image URL.
 *
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
 * {
 *   "id": 1,
 *   "title": "Atomic Habits",
 *   "author": "James Clear",
 *   "year": 2018,
 *   "genre": "Self-help",
 *   "rating": 4.8,
 *   "image": "https://example.com/book.jpg"
 * }
 *
 * @apiError BookNotFound The book was not found.
 * @apiError InvalidId Invalid book ID.
 *
 * @apiErrorExample {json} Error Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "error": "Book not found"
 * }
 */
app.get('/books/:id', (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid book ID' });
    }

    db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch book' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(200).json(row);
    });
});

/**
 * @api {post} /books Add a new book
 * @apiName AddBook
 * @apiGroup Books
 * @apiDescription Creates a new book record.
 *
 * @apiBody {String} title Book title.
 * @apiBody {String} author Book author.
 * @apiBody {Number} year Publication year.
 * @apiBody {String} genre Book genre.
 * @apiBody {Number} rating Book rating from 0 to 5.
 * @apiBody {String} image Book cover image URL.
 *
 * @apiBodyExample {json} Request Example:
 * {
 *   "title": "New Book",
 *   "author": "Author Name",
 *   "year": 2023,
 *   "genre": "Technology",
 *   "rating": 4.5,
 *   "image": "https://example.com/book.jpg"
 * }
 *
 * @apiSuccess {String} message Success message.
 * @apiSuccess {Number} id Newly created book ID.
 *
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 201 Created
 * {
 *   "message": "Book added successfully",
 *   "id": 21
 * }
 *
 * @apiError ValidationError Missing or invalid fields.
 *
 * @apiErrorExample {json} Error Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": "All fields are required"
 * }
 */
app.post('/books', (req, res) => {
    const { title, author, year, genre, rating, image } = req.body;

    if (!title || !author || !year || !genre || rating === undefined || !image) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (title.trim().length < 2 || author.trim().length < 2 || genre.trim().length < 2) {
        return res.status(400).json({ error: 'Title, author and genre must be at least 2 characters long' });
    }

    if (isNaN(year) || Number(year) < 1000 || Number(year) > 2100) {
        return res.status(400).json({ error: 'Year must be between 1000 and 2100' });
    }

    if (isNaN(rating) || Number(rating) < 0 || Number(rating) > 5) {
        return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }

    if (!isValidImageUrl(image)) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    const sql = `
        INSERT INTO books (title, author, year, genre, rating, image)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [title.trim(), author.trim(), Number(year), genre.trim(), Number(rating), image.trim()], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to add book' });
        }

        res.status(201).json({
            message: 'Book added successfully',
            id: this.lastID
        });
    });
});

/**
 * @api {put} /books/:id Update a book
 * @apiName UpdateBook
 * @apiGroup Books
 * @apiDescription Updates an existing book record by ID.
 *
 * @apiParam {Number} id Book unique ID.
 *
 * @apiBody {String} title Book title.
 * @apiBody {String} author Book author.
 * @apiBody {Number} year Publication year.
 * @apiBody {String} genre Book genre.
 * @apiBody {Number} rating Book rating from 0 to 5.
 * @apiBody {String} image Book cover image URL.
 *
 * @apiBodyExample {json} Request Example:
 * {
 *   "title": "Updated Book",
 *   "author": "Updated Author",
 *   "year": 2024,
 *   "genre": "Business",
 *   "rating": 4.7,
 *   "image": "https://example.com/updated-book.jpg"
 * }
 *
 * @apiSuccess {String} message Success message.
 *
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
 * {
 *   "message": "Book updated successfully"
 * }
 *
 * @apiError BookNotFound The book was not found.
 * @apiError ValidationError Missing or invalid fields.
 *
 * @apiErrorExample {json} Error Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": "Rating must be between 0 and 5"
 * }
 */
app.put('/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, year, genre, rating, image } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid book ID' });
    }

    if (!title || !author || !year || !genre || rating === undefined || !image) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (title.trim().length < 2 || author.trim().length < 2 || genre.trim().length < 2) {
        return res.status(400).json({ error: 'Title, author and genre must be at least 2 characters long' });
    }

    if (isNaN(year) || Number(year) < 1000 || Number(year) > 2100) {
        return res.status(400).json({ error: 'Year must be between 1000 and 2100' });
    }

    if (isNaN(rating) || Number(rating) < 0 || Number(rating) > 5) {
        return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }

    if (!isValidImageUrl(image)) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    const sql = `
        UPDATE books
        SET title = ?, author = ?, year = ?, genre = ?, rating = ?, image = ?
        WHERE id = ?
    `;

    db.run(sql, [title.trim(), author.trim(), Number(year), genre.trim(), Number(rating), image.trim(), id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update book' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(200).json({ message: 'Book updated successfully' });
    });
});

/**
 * @api {delete} /books/:id Delete a book
 * @apiName DeleteBook
 * @apiGroup Books
 * @apiDescription Deletes a book record by ID.
 *
 * @apiParam {Number} id Book unique ID.
 *
 * @apiSuccess {String} message Success message.
 *
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
 * {
 *   "message": "Book deleted successfully"
 * }
 *
 * @apiError BookNotFound The book was not found.
 * @apiError InvalidId Invalid book ID.
 *
 * @apiErrorExample {json} Error Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": "Invalid book ID"
 * }
 */
app.delete('/books/:id', (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid book ID' });
    }

    db.run('DELETE FROM books WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete book' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(200).json({ message: 'Book deleted successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});