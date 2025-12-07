# 📚 Instant Book Exchange - Book Exchange Platform

> **University Project - Software Engineering**

> **Silesian University of Technology (Politechnika Śląska)**

## 📖 Overview

**Instant Book Exchange** is a modern, full-stack web application designed to facilitate the exchange of books between users. It promotes a circular economy by allowing users to list books they own and request books they want from others. The platform is gamified with a complex ranking system and achievements to encourage user engagement.

Built with **Next.js 15 (App Router)** and **TypeScript**, it leverages **MongoDB** for data persistence and **Socket.io** for real-time communication features like chat.

## ✨ Key Features

* **Authentication & Authorization:** Secure user registration and login using **NextAuth.js** (credentials & OAuth support).
* **Book Management:** Users can add books to their "Offered" list and maintain a "Wishlist" of books they desire.
* **Exchange System:** Robust transaction system allowing users to initiate and complete book exchanges.
* **Real-time Messaging:** Integrated chat functionality powered by **Socket.io**, enabling users to discuss exchange details in real-time.
* **Ranking System:** A dynamic leaderboard that tracks user activity (exchanges, reviews) and assigns ranks/tiers based on a scoring algorithm.
* **Achievements:** Gamification elements where users earn badges for milestones
* **Responsive UI:** A modern, mobile-first interface built with **Tailwind CSS**, **shadcn**, and **Framer Motion** for smooth animations.
* **Internationalization (i18n):** Support for multiple languages (PL/EN) using `next-intl`.

## 🛠 Tech Stack

### Frontend
* **Framework:** [Next.js 15](https://nextjs.org/) (React 19)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Components:** [shadcn](https://www.shadcn.io/)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **Icons:** Lucide React

### Backend
* **Runtime:** Node.js (via Next.js API Routes)
* **Database:** [MongoDB](https://www.mongodb.com/)
* **ORM:** [Mongoose](https://mongoosejs.com/)
* **Authentication:** [NextAuth.js v5 (Beta)](https://authjs.dev/)
* **Real-time:** [Socket.io](https://socket.io/)

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher recommended)
* MongoDB database (local or Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/szymonwilczek/instant-book-exchange.git
    cd instant-book-exchange 
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory and configure the following variables:
    ```env
    # Database
    MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bookstore

    # Authentication
    AUTH_SECRET=your_super_secret_key_openssl_rand_base64_32
    NEXTAUTH_URL=http://localhost:3000

    # Optional: OAuth Providers
    GOOGLE_CLIENT_ID=...
    GOOGLE_CLIENT_SECRET=...

    # Public Variables
    NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Visit `http://localhost:3000` in your browser.

## 🔌 API Documentation

The application exposes a RESTful API via Next.js Route Handlers. Below is a detailed description of the key endpoints.

### 🔐 Authentication

#### `POST /api/auth/register`
Registers a new user in the system.
* **Request Body:**
    ```json
    {
      "username": "johndoe",
      "email": "john@example.com",
      "password": "securepassword123"
    }
    ```
* **Response (200 OK):**
    ```json
    {
      "message": "User created",
      "userId": "65a1b2c3d4e5f6..."
    }
    ```
* **Errors:** `400 Bad Request` (Missing fields or User exists).

---

### 📚 Books

#### `POST /api/books/create`
Creates a new book listing associated with the logged-in user.
* **Headers:** `Cookie: auth-session` (Requires Authentication)
* **Request Body:**
    ```json
    {
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "description": "A classic novel...",
      "image": "https://url-to-image.com/img.png",
      "genres": ["Classic", "Fiction"]
    }
    ```
* **Response (200 OK):** Returns the created book object with `_id`.

#### `GET /api/books/search?q=query`
Searches for available books by title.
* **Query Parameters:** `q` (string) - The search term.
* **Response (200 OK):** Array of book objects.
    ```json
    [
      {
        "id": "...",
        "title": "...",
        "author": "...",
        "status": "available",
        "source": "local"
      }
    ]
    ```

#### `GET /api/books/available`
Retrieves a list of all books currently available for exchange.

#### `GET /api/books/[id]/view`
Retrieves detailed information about a specific book.

---

### 🔄 Transactions

#### `POST /api/transactions`
Initiates a book exchange transaction between two users.
* **Headers:** `Cookie: auth-session` (Requires Authentication)
* **Request Body:**
    ```json
    {
      "offeredBookId": "book_id_1",
      "wishedBookId": "book_id_2",
      "receiverEmail": "receiver@example.com"
    }
    ```
* **Response (200 OK):**
    ```json
    {
      "transactionId": "transaction_id_123"
    }
    ```

#### `GET /api/transactions/[id]`
Retrieves details of a specific transaction.

---

### 💬 Messages (Chat)

#### `GET /api/messages`
Retrieves the message history for a specific conversation.
* **Headers:** `Cookie: auth-session`
* **Query Parameters:**
    * `conversationId`: ID of the conversation.
    * `limit`: Number of messages to fetch (default: 50).
    * `before`: (Optional) ID of the message to fetch history before (for pagination).
* **Response (200 OK):**
    ```json
    {
      "messages": [
        {
          "_id": "...",
          "content": "Hello!",
          "sender": { "username": "...", ... },
          "createdAt": "..."
        }
      ]
    }
    ```

#### `POST /api/messages`
Sends a new message in a conversation.
* **Headers:** `Cookie: auth-session`
* **Request Body:**
    ```json
    {
      "conversationId": "conv_id_123",
      "content": "Is the book still available?",
      "attachments": []
    }
    ```
* **Response (200 OK):** Returns the created message object.

---

### 🏆 Ranking & Leaderboard

#### `GET /api/ranking/leaderboard`
Fetches the global leaderboard with pagination.
* **Query Parameters:**
    * `page`: Page number (default: 1).
    * `limit`: Items per page (default: 100).
* **Response (200 OK):**
    ```json
    {
      "users": [
        {
          "username": "MasterReader",
          "totalScore": 1500,
          "rank": 1,
          "tier": "Diamond",
          "stats": { ... }
        }
      ],
      "total": 50,
      "currentPage": 1,
      "totalPages": 1
    }
    ```

---

### 👤 User Profile

* **`GET /api/user/profile`**: Fetches the current user's full profile data.
* **`GET /api/user/wishlist`**: Fetches books in the current user's wishlist.
* **`GET /api/user/offered-books`**: Fetches books offered by the current user.

## 📁 Project Structure

```bash
bookstore/
├── app/                                  # Next.js App Router (Main Application Logic)
│   ├── [locale]/                         # Internationalized routes (pl/en)
│   │   ├── achievements/                 # User achievements and badges page
│   │   ├── admin/                        # Admin dashboard
│   │   ├── checkout/                     # Book exchange process (Drag & Drop interface)
│   │   ├── leaderboard/                  # Global user ranking and statistics
│   │   ├── login/                        # User authentication page
│   │   ├── messages/                     # Real-time chat and conversation list
│   │   ├── profile/                      # User profile management (dashboard, inventory)
│   │   ├── register/                     # New user registration page
│   │   ├── transactions/                 # Transaction history and status management
│   │   ├── users/[id]/                   # Public profile view of other users
│   │   ├── layout.tsx                    # Root layout (Providers, Navbar, Footer)
│   │   └── page.tsx                      # Landing page with hero and featured books
│   ├── api/                              # Backend API Endpoints (Route Handlers)
│   │   ├── achievements/                 # Achievement verification and granting logic
│   │   ├── auth/                         # Authentication handling (NextAuth, registration)
│   │   ├── books/                        # Book CRUD, search, and promotion logic
│   │   ├── cart/                         # Shopping cart management for exchanges
│   │   ├── checkout/                     # Transaction finalization endpoints
│   │   ├── conversations/                # Chat conversation management
│   │   ├── cron/                         # Scheduled tasks
│   │   ├── matches/                      # User-book matching algorithms
│   │   ├── messages/                     # Message sending and Socket.io events
│   │   ├── notifications/                # User notification system
│   │   ├── ranking/                      # Leaderboard calculation and tier logic
│   │   ├── reviews/                      # User rating and review system
│   │   ├── transactions/                 # Exchange transaction processing
│   │   ├── upload/                       # File upload handlers (images)
│   │   └── user/                         # User data (onboarding, wishlist, stats)
│   ├── favicon.ico                       # Application favicon
│   └── globals.css                       # Global Tailwind CSS styles
├── assets/                               # Static assets (SVG components)
│   └── svg/                              # Custom SVG icons and backgrounds
├── components/                           # Reusable React UI Components
│   ├── achievements/                     # Badges, cards, and carousels for achievements
│   ├── checkout/                         # Exchange UI (Inventory, Drag items, Zone)
│   ├── home/                             # Landing page sections (Filters, Listings, Promoted)
│   ├── icons/                            # Custom icon components
│   ├── login/                            # Login forms and layouts
│   ├── messages/                         # Chat UI (Window, Input, Conversation list)
│   ├── navbar/                           # Navigation, User Menu, Cart Sheet
│   ├── profile/                          # Profile sections (Stats, History, Wishlist, Modals)
│   ├── ranking/                          # Leaderboard tables, cards, and comparison tools
│   ├── register/                         # Registration forms
│   ├── transactions/                     # Transaction cards and review modals
│   └── ui/                               # Shadcn/Radix UI primitives (Button, Card, Dialog, etc.)
├── lib/                                  # Business Logic, Utilities, and Hooks
│   ├── achievements/                     # Achievement rules and checking engines
│   ├── context/                          # React Contexts (Cart, Socket.io)
│   ├── cron/                             # Background job logic
│   ├── data/                             # Static data
│   ├── db/                               # MongoDB connection configuration
│   ├── hooks/                            # Custom React Hooks
│   ├── models/                           # Mongoose Schemas
│   ├── ranking/                          # Ranking algorithms and score calculators
│   ├── types/                            # TypeScript type definitions
│   ├── utils/                            # Utility functions (formatting, validation)
│   └── matching.ts                       # Book matching logic
├── messages/                             # Internationalization (i18n) translation files
│   ├── en.json                           # English translations
│   └── pl.json                           # Polish translations
├── public/                               # Static public assets
│   ├── images/                           # Placeholder images and banners
│   └── sounds/                           # Notification sounds
├── i18n.ts                               # Next-intl configuration
├── middleware.ts                         # Middleware for locale routing and auth protection
├── next.config.ts                        # Next.js framework configuration
├── tailwind.config.ts                    # Tailwind CSS configuration
└── tsconfig.json                         # TypeScript configuration
```

## 📜 License

This project was created for educational purposes at the Silesian University of Technology.
