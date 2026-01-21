# Project Overview

**Chatty** is a real-time messaging application.

*   **Architecture**: Client-Server (Frontend talks to Backend).
*   **Communication**: Hybrid approach.
    *   **HTTP (REST API)**: For "slow" actions like logging in, signing up, and loading old messages.
    *   **WebSockets (Socket.IO)**: For "fast" actions like sending/receiving messages instantly and seeing who is online.

## 2. Technology Stack & Libraries

### Backend Dependencies (Node.js + Express)

These are the libraries used in the `backend/package.json` file.

*   **`express`**:
    *   **Why**: It is the most popular web framework for Node.js. It simplifies the process of creating API routes (endpoints), handling HTTP requests/responses, and managing middleware.
*   **`mongoose`**:
    *   **Why**: An ODM (Object Data Modeling) library for MongoDB. It allows us to define schemas for our data (like `User` and `Message` models) and interact with the database using cleaner JavaScript syntax instead of raw database queries.
*   **`socket.io`**:
    *   **Why**: Enables real-time, bidirectional communication between the web client and the server. This is the core engine behind the instant messaging features.
*   **`jsonwebtoken` (JWT)**:
    *   **Why**: Used for securely transmitting information between parties as a JSON object. We use it to create "access tokens" (cookies) that prove a user is logged in.
*   **`bcryptjs`**:
    *   **Why**: A library to hash passwords. We never store plain text passwords in the database; `bcryptjs` turns "password123" into a secure, irreversible string.
*   **`cookie-parser`**:
    *   **Why**: Express doesn't read cookies by default. This middleware parses the `Cookie` header and populates `req.cookies`, allowing us to easily read the JWT token.
*   **`cors`**:
    *   **Why**: Stands for Cross-Origin Resource Sharing. It is a security feature that allows our frontend (running on one domain/port) to talk to our backend (running on a different domain/port).
*   **`dotenv`**:
    *   **Why**: Loads environment variables from a `.env` file into `process.env`. This keeps secrets like API keys and database URLs out of the source code.
*   **`cloudinary`**:
    *   **Why**: A service for storing images in the cloud. We use it to upload and host user profile pictures and image attachments.
*   **`nodemon` (Dev Dependency)**:
    *   **Why**: A utility that automatically restarts the Node.js application when file changes in the directory are detected, speeding up development.

### Frontend Dependencies (React + Vite)

These are the libraries used in the `frontend/package.json` file.

*   **`react` / `react-dom`**:
    *   **Why**: The core library for building the user interface. It lets us create reusable components (like buttons, chat bubbles) and manage the view layer.
*   **`react-router-dom`**:
    *   **Why**: Enables client-side routing. It allows us to navigate between pages (Login, Signup, Home) without reloading the browser.
*   **`zustand`**:
    *   **Why**: A small, fast, and scalable state management solution. We use it to store global data like the current user, list of messages, and theme preferences so they can be accessed from any component.
*   **`axios`**:
    *   **Why**: A promise-based HTTP client. We use it to make requests to our backend API (e.g., `axios.post('/login')`). It handles things like JSON transformation and error handling better than the native `fetch` API.
*   **`socket.io-client`**:
    *   **Why**: The client-side version of Socket.IO. It connects to the backend socket server and listens for events like "newMessage" or "getOnlineUsers".
*   **`react-hot-toast`**:
    *   **Why**: Adds beautiful notifications to the app. We use it to show success messages ("Logged in successfully") or errors ("Invalid password").
*   **`lucide-react`**:
    *   **Why**: A collection of beautiful SVG icons (like the user icon, settings gear, send arrow) used throughout the UI.
*   **`tailwindcss` (Dev Dependency)**:
    *   **Why**: A utility-first CSS framework. It allows us to style components directly in the HTML/JSX (e.g., `className="flex items-center justify-center"`) without writing separate CSS files.
*   **`daisyui` (Dev Dependency)**:
    *   **Why**: A component library for Tailwind CSS. It gives us pre-styled components like buttons, inputs, and modals, saving us time on design.
*   **`vite` (Dev Dependency)**:
    *   **Why**: The build tool and development server. It is extremely fast and optimized for modern web development, replacing older tools like Webpack.

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

## 5. Feature Flows (New)

### 1. Real-Time Chat Flow
1.  **Sending**: User types a message in `MessageInput.jsx` and clicks Send.
2.  **API Call**: `sendMessage` in `useChatStore.js` sends an HTTP POST request to `/api/messages/send/:id`.
3.  **Database**: Backend saves the message to MongoDB with `status: "sent"`.
4.  **Socket Emit**: Backend finds the receiver's `socketId` and emits `newMessage` only to them.
5.  **UI Update**: Frontend (Receiver) listens for `newMessage` and updates the `messages` array instantly.

### 2. Typing Status Flow
1.  **Trigger**: User types in `MessageInput.jsx`.
2.  **Socket Emit**: Frontend emits `typing` event to backend with `receiverId`.
3.  **Backend Relay**: Backend finds receiver's `socketId` and emits `typing` to them.
4.  **UI Update**: Receiver's `ChatContainer.jsx` sees `isTyping: true` and shows "Typing..." indicator.
5.  **Stop**: After 3 seconds of no typing, frontend emits `stopTyping`, and indicator disappears.

### 3. Read Receipts (Seen/Delivered) Flow
1.  **Sent**: Default status when a message is created.
2.  **Delivered**: (Future implementation) Could be triggered when receiver's socket receives the message.
3.  **Seen**: 
    *   When a user opens a chat, frontend emits `markMessagesAsSeen` via socket.
    *   Backend updates all messages from that sender to `status: "seen"` in DB.
    *   Backend emits `messagesSeen` back to the original sender.
    *   Sender's UI updates the checkmarks to blue/primary color.

## 6. Folder Structure Details

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
