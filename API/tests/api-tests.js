import { RequestLogger } from 'testcafe';

const getBooksLogger = RequestLogger('http://localhost:3000/books', {
    logResponseBody: true,
    logResponseHeaders: true,
    logRequestBody: true,
    stringifyResponseBody: true
});

fixture`Book Library API Tests`
    .requestHooks(getBooksLogger);

test('GET /books should return all books', async t => {
    const response = await t.request({
        url: 'http://localhost:3000/books',
        method: 'GET'
    });

    await t.expect(response.status).eql(200);
    await t.expect(Array.isArray(response.body)).ok();
    await t.expect(response.body.length).gt(0);
});

test('GET /books/:id should return one book', async t => {
    const response = await t.request({
        url: 'http://localhost:3000/books/1',
        method: 'GET'
    });

    await t.expect(response.status).eql(200);
    await t.expect(response.body.id).eql(1);
    await t.expect(response.body.title).ok();
});

test('GET /books/:id with invalid ID should return 400', async t => {
    const response = await t.request({
        url: 'http://localhost:3000/books/abc',
        method: 'GET'
    });

    await t.expect(response.status).eql(400);
    await t.expect(response.body.error).eql('Invalid book ID');
});

test('POST /books should create a new book', async t => {
    const newBook = {
        title: 'Test Driven Development',
        author: 'Kent Beck',
        year: 2003,
        genre: 'Programming',
        rating: 4.6,
        image: 'https://dummyimage.com/400x600/1f2937/ffffff&text=TDD'
    };

    const response = await t.request({
        url: 'http://localhost:3000/books',
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: newBook
    });

    await t.expect(response.status).eql(201);
    await t.expect(response.body.message).eql('Book added successfully');
    await t.expect(response.body.id).ok();
});

test('POST /books with missing fields should return 400', async t => {
    const badBook = {
        title: '',
        author: 'Someone'
    };

    const response = await t.request({
        url: 'http://localhost:3000/books',
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: badBook
    });

    await t.expect(response.status).eql(400);
    await t.expect(response.body.error).ok();
});

test('PUT /books/:id should update a book', async t => {
    const updatedBook = {
        title: 'Atomic Habits Updated',
        author: 'James Clear',
        year: 2018,
        genre: 'Self-help',
        rating: 4.9,
        image: 'https://dummyimage.com/400x600/0f172a/ffffff&text=Updated+Book'
    };

    const response = await t.request({
        url: 'http://localhost:3000/books/1',
        method: 'PUT',
        headers: {
            'content-type': 'application/json'
        },
        body: updatedBook
    });

    await t.expect(response.status).eql(200);
    await t.expect(response.body.message).eql('Book updated successfully');
});

test('PUT /books/:id with invalid ID should return 400', async t => {
    const updatedBook = {
        title: 'Bad Update',
        author: 'Test',
        year: 2024,
        genre: 'Test',
        rating: 4.0,
        image: 'https://dummyimage.com/400x600/111827/ffffff&text=Bad'
    };

    const response = await t.request({
        url: 'http://localhost:3000/books/xyz',
        method: 'PUT',
        headers: {
            'content-type': 'application/json'
        },
        body: updatedBook
    });

    await t.expect(response.status).eql(400);
    await t.expect(response.body.error).eql('Invalid book ID');
});

test('DELETE /books/:id should delete a book', async t => {
    const createResponse = await t.request({
        url: 'http://localhost:3000/books',
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: {
            title: 'Delete Me',
            author: 'Temporary Author',
            year: 2025,
            genre: 'Testing',
            rating: 4.0,
            image: 'https://dummyimage.com/400x600/000000/ffffff&text=Delete+Me'
        }
    });

    const createdId = createResponse.body.id;

    const deleteResponse = await t.request({
        url: `http://localhost:3000/books/${createdId}`,
        method: 'DELETE'
    });

    await t.expect(deleteResponse.status).eql(200);
    await t.expect(deleteResponse.body.message).eql('Book deleted successfully');
});

test('DELETE /books/:id with invalid ID should return 400', async t => {
    const response = await t.request({
        url: 'http://localhost:3000/books/invalid',
        method: 'DELETE'
    });

    await t.expect(response.status).eql(400);
    await t.expect(response.body.error).eql('Invalid book ID');
});