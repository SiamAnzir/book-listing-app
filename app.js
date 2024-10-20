let books = [];
let filteredBooks = [];
let currentPage = 1;
let apiResponse = {};
let genre = [];
const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

const API_URL = "https://gutendex.com/books/";

document.addEventListener("DOMContentLoaded", () => {
    fetchBooks(API_URL);
    setupEventListeners();
});

async function fetchBooks(url) {
    const spinner = document.getElementById("spinner");
    const bookList = document.getElementById("book-list");
    const searchAndFilter = document.getElementById("search-and-filter");
    const pagination = document.getElementById("pagination");

    try {
        spinner.style.display = "block";
        searchAndFilter.style.display = "none";
        pagination.style.display = "none";
        bookList.innerHTML = "";
        const response = await fetch(url);
        const data = await response.json();
        apiResponse = data;
        books = data.results;
        filteredBooks = [...books];
        displayBooks();
    } catch (error) {
        console.error("Error fetching books:", error);
    } finally {
        spinner.style.display = "none";
        searchAndFilter.style.display = "block";
        pagination.style.display = "flex";
    }
}

function displayBooks() {
    const bookList = document.getElementById("book-list");
    bookList.innerHTML = "";
    filteredBooks.forEach((book) => {
        const bookCard = document.createElement("div");
        bookCard.classList.add("book-card");
        bookCard.innerHTML = `
            <img src="${book.formats["image/jpeg"]}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p>by <b>${
              book.authors[0]?.name ? book.authors[0].name : ""
            }</b></p>
            <p><b>Genre: </b>${book.subjects.map((subject) => subject)}</p>
            <button class="wishlist-btn" data-id="${book.id}">
                ${
                  isBookInWishlist(book.id)
                    ? "❤️ Remove From Wishlist"
                    : "♡ Add To Wishlist"
                }
            </button>
        `;
        bookList.appendChild(bookCard);
    });

    document.getElementById("page-info").textContent = `${currentPage}`;
}

function isBookInWishlist(bookId) {
    return wishlist.some((book) => book.id === bookId);
}

function setupEventListeners() {
    // Search functionality
    document.getElementById("search-bar").addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filteredBooks = books.filter((book) =>
            book.title.toLowerCase().includes(searchTerm)
        );
        currentPage = 1;
        displayBooks();
    });

    // Wishlist toggle
    document.getElementById("book-list").addEventListener("click", (e) => {
        if (e.target.classList.contains("wishlist-btn")) {
            const bookId = Number(e.target.dataset.id);
            const book = books.find((b) => b.id === bookId);
            toggleWishlist(book);
            displayBooks();
        }
    });

    // Pagination
    document.getElementById("prev-page").addEventListener("click", () => {
        if (apiResponse.previous) {
            currentPage--;
            fetchBooks(apiResponse.previous);
        }
    });

    document.getElementById("next-page").addEventListener("click", () => {
        if (apiResponse.next) {
            currentPage++;
            fetchBooks(apiResponse.next);
        }
    });

    // Load wishlist page
    document.getElementById("wishlist-link").addEventListener("click", () => {
        filteredBooks = wishlist;
        currentPage = 1;
        displayBooks();
    });

    // Load home page
    document.getElementById("home-link").addEventListener("click", () => {
        filteredBooks = [...books];
        currentPage = 1;
        displayBooks();
    });
}

function toggleWishlist(book) {
    const index = wishlist.findIndex((b) => b.id === book.id);
    if (index === -1) {
        wishlist.push(book);
    } else {
        wishlist.splice(index, 1);
    }
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}