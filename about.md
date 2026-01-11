# Project Overview

**Chatty** is a real-time messaging application.

*   **Architecture**: Client-Server (Frontend talks to Backend).
*   **Communication**: Hybrid approach.
    *   **HTTP (REST API)**: For "slow" actions like logging in, signing up, and loading old messages.
    *   **WebSockets (Socket.IO)**: For "fast" actions like sending/receiving messages instantly and seeing who is online.

## 2. Technology Stack & Libraries

### Backend (Node.js + Express)

*   **`express`**: The web framework that handles API routes (`/api/auth`, `/api/messages`).
*   **`mongoose`**: Connects to your MongoDB database to save users and messages.
*   **`socket.io`**: Enables real-time, two-way communication.
*   **`jsonwebtoken` (JWT)**: Creates secure "passes" so users stay logged in.
*   **`cookie-parser`**: Reads these JWTs from browser cookies.
*   **`bcryptjs`**: Scrambles passwords so they are stored securely (e.g., "password123" becomes `$2a$10$Eix...`).
*   **`cloudinary`**: Stores user profile pictures and image attachments in the cloud.

### Frontend (React + Vite)

*   **`react-router-dom`**: Handles navigation (switching between Login, Home, Profile pages).
*   **`zustand`**: Manages global state (keeping track of "Who am I?", "Who is online?", "What are my messages?").
*   **`axios`**: The HTTP client used to make requests to the backend (like a better version of `fetch`).
*   **`socket.io-client`**: The browser-side library that listens for real-time events from the server.
*   **`daisyui` + `tailwindcss`**: Styling libraries for building beautiful, responsive UI components quickly.

## 3. Backend Architecture (The "Brain")

### Entry Point (`backend/src/index.js`)

This is where the server starts.

*   **Database**: Connects to MongoDB.
*   **Middleware**: Sets up CORS (security), JSON parsing (reading data), and Cookie parsing.
*   **Routes**: Defines the main API paths:
    *   `/api/auth` -> Goes to `auth.route.js`
    *   `/api/messages` -> Goes to `message.route.js`

### Authentication Flow

**File**: `backend/src/controllers/auth.controller.js`

*   **Signup**: Hashes the password, creates a user in DB, generates a JWT, and sends it as a cookie.
*   **Login**: Checks email/password, generates a JWT, sends it as a cookie.
*   **CheckAuth**: Verifies the cookie to see if the user is still logged in when they refresh the page.

### Real-Time Logic (`backend/src/lib/socket.js`)

This file wraps the Express server with Socket.IO.

*   It maintains a `userSocketMap` object: `{ userId: socketId }`.
*   **Connection**: When a user logs in, their `userId` is mapped to their live connection `socketId`.
*   **Broadcasting**: It emits events like `getOnlineUsers` to let everyone know who just came online.

## 4. Frontend Architecture (The "Face")

### Entry Point (`frontend/src/App.jsx`)

This is the main layout.

*   **Routing**: Checks if `authUser` exists.
    *   If **Yes**: Shows `<HomePage />`.
    *   If **No**: Redirects to `<LoginPage />`.
*   **Initialization**: Calls `checkAuth()` on load to see if a session exists.

### State Management (Zustand)

As explained before, this is the "memory" of your frontend.

*   `useAuthStore`: "Am I logged in? Who is online?"
*   `useChatStore`: "Who am I talking to? What are our messages?"
*   `useThemeStore`: "Dark mode or Light mode?"

### API Layer (`frontend/src/lib/axios.js`)

A pre-configured tool for making requests.

*   It knows the backend URL (`baseURL`).
*   `withCredentials: true`: This is CRITICAL. It tells the browser, "Always send the HTTP-Only cookie with every request." Without this, the backend wouldn't know who you are.

## 5. The Flow: "Sending a Message"

Here is how data travels from one user to another:

1.  **User Types**: You type "Hello" and hit send in the frontend.
2.  **API Call**: `useChatStore` calls `axiosInstance.post('/messages/send/:id', { text: "Hello" })`.
3.  **Backend Processing** (`message.controller.js`):
    *   Server receives the request.
    *   Saves the message to MongoDB.
    *   **Real-Time Magic**: It looks up the receiver's `socketId` using `getReceiverSocketId(receiverId)`.
    *   `io.to(receiverSocketId).emit("newMessage", newMessage)`: Sends the data *directly* to that specific user's open browser tab.
4.  **Frontend Update**:
    *   The receiver's browser (listening via `useChatStore.subscribeToMessages`) hears the `newMessage` event.
    *   It instantly pushes the new message into the `messages` array.
    *   React re-renders the screen, and the message pops up.

## 6. Deployment Setup (Vercel & Render)

*   **Frontend (Vercel)**: Serves the React static files. It needs `VITE_API_URL` to know where the backend lives.
*   **Backend (Render)**: Runs the Node.js server. It needs `CLIENT_URL` to know which frontend is allowed to connect (CORS security).

## 7. Folder Structure Details

### Backend (`backend/src/`)

*   **`controllers/`**: Contains the business logic for handling requests.
    *   `auth.controller.js`: Handles signup, login, logout, and profile updates.
    *   `message.controller.js`: Handles sending, receiving, and retrieving messages.
*   **`lib/`**: Helper libraries and configurations.
    *   `cloudinary.js`: Cloudinary configuration for image uploads.
    *   `db.js`: Database connection logic using Mongoose.
    *   `socket.js`: Socket.IO server setup and event handling.
    *   `utils.js`: Utility functions (e.g., token generation).
*   **`middleware/`**: Express middleware functions.
    *   `auth.middleware.js`: Protects routes by verifying the JWT cookie.
*   **`models/`**: Mongoose data models.
    *   `user.model.js`: Schema for user data (email, password, etc.).
    *   `message.model.js`: Schema for message data (sender, receiver, text, image).
*   **`routes/`**: API route definitions.
    *   `auth.route.js`: Maps authentication endpoints to controller functions.
    *   `message.route.js`: Maps message endpoints to controller functions.
*   **`seeds/`**: Scripts to populate the database with initial data (e.g., test users).
*   **`index.js`**: The main entry point for the backend server.

### Frontend (`frontend/src/`)

*   **`assets/`**: Static assets like images and SVGs.
*   **`components/`**: Reusable UI components.
    *   `skeletons/`: Loading state placeholders (e.g., `MessageSkeleton.jsx`).
    *   `Navbar.jsx`: The top navigation bar.
    *   `Sidebar.jsx`: The user list sidebar.
    *   `ChatContainer.jsx`: The main chat area.
    *   `MessageInput.jsx`: The text input field for sending messages.
*   **`constants/`**: Constant values used across the app (e.g., theme definitions).
*   **`lib/`**: Helper libraries.
    *   `axios.js`: Configured Axios instance for API requests.
    *   `utils.js`: Frontend utility functions (e.g., date formatting).
*   **`pages/`**: The main page views.
    *   `HomePage.jsx`: The main chat interface.
    *   `LoginPage.jsx`: The login screen.
    *   `SignUpPage.jsx`: The signup screen.
    *   `ProfilePage.jsx`: The user profile settings screen.
    *   `SettingsPage.jsx`: Theme customization screen.
*   **`store/`**: Global state management stores using Zustand.
    *   `useAuthStore.js`: Authentication state.
    *   `useChatStore.js`: Chat messages and user state.
    *   `useThemeStore.js`: UI theme state.
*   **`App.jsx`**: The root React component handling routing and layout.
*   **`main.jsx`**: The entry point that mounts the React app to the DOM.

## 8. Detailed Route & Chat Flows

### 8.1 API Route Flow
This section explains how a request travels from the User to the Database and back.

#### **Authentication Routes (`/api/auth`)**
1.  **POST `/api/auth/signup`**
    *   **Frontend**: User enters Name, Email, Password -> Hits Signup button.
    *   **Route**: `auth.route.js` -> `router.post("/signup", signup)`
    *   **Controller**: `auth.controller.js` -> `signup()`
        *   Checks if email exists.
        *   Hashes password with `bcryptjs`.
        *   Creates new `User` in MongoDB.
        *   Generates JWT Token -> Sets it as an `httpOnly` cookie.
    *   **Response**: Returns user data (without password).

2.  **POST `/api/auth/login`**
    *   **Frontend**: User enters Email, Password -> Hits Login button.
    *   **Route**: `auth.route.js` -> `router.post("/login", login)`
    *   **Controller**: `auth.controller.js` -> `login()`
        *   Finds user by email.
        *   Compares hashed passwords.
        *   Generates new JWT Token -> Sets cookie.
    *   **Response**: Returns user data + triggers Socket connection.

3.  **GET `/api/auth/check`** (Session Persistence)
    *   **Frontend**: App loads (refresh/open). `useEffect` calls `checkAuth()`.
    *   **Route**: `auth.route.js` -> `router.get("/check", protectRoute, checkAuth)`
    *   **Middleware**: `auth.middleware.js` -> `protectRoute()`
        *   Reads `jwt` cookie.
        *   Verifies token signature.
        *   Attaches `req.user` to request object.
    *   **Controller**: Returns `req.user`.

#### **Message Routes (`/api/messages`)**
*   **Protected**: All these routes use `protectRoute` middleware.

1.  **GET `/api/messages/users`** (Sidebar)
    *   **Frontend**: `useChatStore.getUsers()` calls this on load.
    *   **Controller**: `message.controller.js` -> `getUsersForSidebar()`
    *   **Logic**: `User.find({ _id: { $ne: loggedInUserId } })` (Find all users except me).

2.  **GET `/api/messages/:id`** (Chat History)
    *   **Frontend**: User clicks a contact in sidebar.
    *   **Controller**: `message.controller.js` -> `getMessages()`
    *   **Logic**: Find messages where `(sender=me AND receiver=you) OR (sender=you AND receiver=me)`.

3.  **POST `/api/messages/send/:id`** (Sending)
    *   **Frontend**: User types message + Hits Send.
    *   **Controller**: `message.controller.js` -> `sendMessage()`
    *   **Logic**:
        *   If image exists -> Upload to Cloudinary first.
        *   Create new `Message` document in MongoDB.
        *   **Socket Step**: Emit `newMessage` event to receiver's socket ID.
    *   **Response**: Returns the saved message object.

---

### 8.2 Real-Time Chat Flow (Socket.IO)
This explains how messages appear instantly without refreshing.

**Step 1: Connection**
*   **User Logs In**: Frontend `useAuthStore` calls `connectSocket()`.
*   **Handshake**: Client connects to Backend URL.
*   **Query Param**: Passes `userId` in the connection URL (`?userId=123`).
*   **Server (`socket.js`)**:
    *   Catches connection event.
    *   Stores mapping: `userSocketMap[userId] = socket.id`.
    *   Emits `getOnlineUsers` event to **ALL** clients.

**Step 2: Sending a Message**
*   **Sender**: Calls HTTP API `/api/messages/send/:id`.
*   **Server (Controller)**:
    *   Saves message to DB (Persistence).
    *   Looks up Receiver's socket ID: `const socketId = getReceiverSocketId(receiverId)`.
    *   **If Receiver is Online**: `io.to(socketId).emit("newMessage", message)`.

**Step 3: Receiving a Message**
*   **Receiver (Frontend)**:
    *   `useChatStore` is listening: `socket.on("newMessage", callback)`.
    *   **Event Triggered**: The callback runs with the new message data.
    *   **State Update**: The store checks `if (message.senderId === selectedUser._id)`.
        *   If TRUE: Appends message to `messages` array.
    *   **UI Update**: React re-renders `<ChatContainer />`, displaying the new bubble.
