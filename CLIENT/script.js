const apiBaseUrl = 'http://localhost:3000/books';

const bookForm = document.getElementById('bookForm');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const booksContainer = document.getElementById('booksContainer');
const message = document.getElementById('message');
const refreshBtn = document.getElementById('refreshBtn');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const loadingState = document.getElementById('loadingState');
const bookCount = document.getElementById('bookCount');

let editingBookId = null;

function showMessage(text, type = 'success') {
    message.textContent = text;
    message.style.color = type === 'success' ? '#86efac' : '#fca5a5';

    setTimeout(() => {
        message.textContent = '';
    }, 3000);
}

function renderStars(rating) {
    const fullStars = Math.round(rating);
    let stars = '';

    for (let i = 0; i < 5; i++) {
        stars += i < fullStars ? '★' : '☆';
    }

    return stars;
}

function getFormData() {
    return {
        title: document.getElementById('title').value.trim(),
        author: document.getElementById('author').value.trim(),
        year: Number(document.getElementById('year').value),
        genre: document.getElementById('genre').value.trim(),
        rating: Number(document.getElementById('rating').value),
        image: document.getElementById('image').value.trim()
    };
}

function resetForm() {
    bookForm.reset();
    editingBookId = null;
    formTitle.textContent = 'Add New Book';
    submitBtn.textContent = 'Add Book';
    cancelEditBtn.classList.add('hidden');
}

function fillForm(book) {
    document.getElementById('title').value = book.title;
    document.getElementById('author').value = book.author;
    document.getElementById('year').value = book.year;
    document.getElementById('genre').value = book.genre;
    document.getElementById('rating').value = book.rating;
    document.getElementById('image').value = book.image;

    editingBookId = book.id;
    formTitle.textContent = 'Edit Book';
    submitBtn.textContent = 'Update Book';
    cancelEditBtn.classList.remove('hidden');

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function createBookCard(book) {
    return `
        <div class="book-card">
            <div class="book-image-wrap">
                <img src="${book.image}" alt="${book.title}" class="book-image" onerror="this.src='https://via.placeholder.com/400x600?text=No+Image'">
                <div class="book-overlay"></div>
            </div>

            <div class="book-content">
                <h3 class="book-title">${book.title}</h3>

                <div class="book-meta">
                    <p><strong>Author:</strong> ${book.author}</p>
                    <p><strong>Year:</strong> ${book.year}</p>
                    <p><strong>Rating:</strong> ${book.rating}/5</p>
                </div>

                <span class="genre-chip">${book.genre}</span>
                <div class="rating-stars">${renderStars(book.rating)}</div>

                <div class="card-actions">
                    <button class="edit-btn" onclick="startEdit(${book.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteBook(${book.id})">Delete</button>
                </div>
            </div>
        </div>
    `;
}

async function fetchBooks(search = '') {
    loadingState.style.display = 'block';
    booksContainer.innerHTML = '';

    try {
        const url = search
            ? `${apiBaseUrl}?search=${encodeURIComponent(search)}`
            : apiBaseUrl;

        const response = await fetch(url);
        const books = await response.json();

        loadingState.style.display = 'none';

        if (!response.ok) {
            booksContainer.innerHTML = `<div class="empty-state">Failed to load books.</div>`;
            bookCount.textContent = '0 Books';
            return;
        }

        if (!books.length) {
            booksContainer.innerHTML = `<div class="empty-state">No books found for your search.</div>`;
            bookCount.textContent = '0 Books';
            return;
        }

        booksContainer.innerHTML = books.map(createBookCard).join('');
        bookCount.textContent = `${books.length} Book${books.length > 1 ? 's' : ''}`;
    } catch (error) {
        loadingState.style.display = 'none';
        booksContainer.innerHTML = `<div class="empty-state">Something went wrong while loading books.</div>`;
        bookCount.textContent = '0 Books';
    }
}

bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const book = getFormData();

    const method = editingBookId ? 'PUT' : 'POST';
    const endpoint = editingBookId ? `${apiBaseUrl}/${editingBookId}` : apiBaseUrl;

    try {
        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(book)
        });

        const result = await response.json();

        if (!response.ok) {
            showMessage(result.error || 'Request failed', 'error');
            return;
        }

        showMessage(result.message || 'Success', 'success');
        resetForm();
        fetchBooks(searchInput.value.trim());
    } catch (error) {
        showMessage('Network error occurred', 'error');
    }
});

async function startEdit(id) {
    try {
        const response = await fetch(`${apiBaseUrl}/${id}`);
        const book = await response.json();

        if (!response.ok) {
            showMessage(book.error || 'Book not found', 'error');
            return;
        }

        fillForm(book);
    } catch (error) {
        showMessage('Failed to load book for editing', 'error');
    }
}

async function deleteBook(id) {
    const confirmDelete = confirm('Are you sure you want to delete this book?');

    if (!confirmDelete) return;

    try {
        const response = await fetch(`${apiBaseUrl}/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            showMessage(result.error || 'Delete failed', 'error');
            return;
        }

        showMessage(result.message || 'Book deleted', 'success');
        fetchBooks(searchInput.value.trim());
    } catch (error) {
        showMessage('Failed to delete book', 'error');
    }
}

cancelEditBtn.addEventListener('click', () => {
    resetForm();
});

refreshBtn.addEventListener('click', () => {
    searchInput.value = '';
    fetchBooks();
});

searchBtn.addEventListener('click', () => {
    fetchBooks(searchInput.value.trim());
});

searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        fetchBooks(searchInput.value.trim());
    }
});

fetchBooks();

window.startEdit = startEdit;
window.deleteBook = deleteBook;