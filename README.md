# Chatty - Real-Time Chat Application

## 📋 Project Overview

**Chatty** is a full-stack real-time chat application that enables users to communicate with each other through instant messaging. The application supports text messages, image sharing, real-time message delivery, online/offline status tracking, and user profile management. It's built with a modern tech stack emphasizing real-time communication, security, and user experience.

## 🎯 Purpose & Use Case

This project demonstrates a production-ready chat application with:
- **Real-time Communication**: Instant message delivery using WebSockets (Socket.IO)
- **User Authentication**: Secure JWT-based authentication with password hashing
- **Media Sharing**: Image upload and sharing via Cloudinary integration
- **Responsive Design**: Modern UI with theme customization using Tailwind CSS and DaisyUI
- **State Management**: Efficient state management using Zustand
- **Scalable Architecture**: RESTful API design with clear separation of concerns

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs for password hashing
- **File Storage**: Cloudinary for image uploads
- **Security**: Cookie-based authentication with httpOnly and secure flags

### Frontend
- **Framework**: React 18.3 with React Router v7
- **Build Tool**: Vite 6
- **State Management**: Zustand
- **Styling**: Tailwind CSS + DaisyUI (theme support)
- **HTTP Client**: Axios with credentials support
- **Real-time**: Socket.IO Client
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Type Safety**: ESLint for code quality

## 🏗️ Architecture

### Project Structure
```
chatty/
├── backend/          # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   ├── lib/            # Utilities (DB, Socket, Cloudinary)
│   │   └── index.js        # Server entry point
│   └── package.json
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── lib/            # Utilities (Axios, utils)
│   │   └── main.jsx        # App entry point
│   └── package.json
└── package.json      # Root package.json
```

### Architecture Pattern
- **Backend**: MVC (Model-View-Controller) pattern
- **Frontend**: Component-based architecture with custom hooks
- **State Management**: Centralized state with Zustand stores
- **API Design**: RESTful API with Socket.IO for real-time features

## 🔑 Key Features

### 1. User Authentication
- **Sign Up**: User registration with email, full name, and password validation
- **Login**: Secure login with email and password
- **Logout**: Session termination
- **Protected Routes**: JWT-based route protection
- **Auto Authentication**: Automatic session validation on app load

### 2. Real-Time Messaging
- **Instant Delivery**: Messages delivered in real-time using Socket.IO
- **Message History**: Persistent message storage in MongoDB
- **Image Sharing**: Upload and share images via Cloudinary
- **Message Timestamps**: Formatted message timestamps
- **Online/Offline Status**: Real-time user presence tracking

### 3. User Management
- **Profile Management**: Update profile picture
- **User Discovery**: View all registered users (excluding self)
- **Online Status Filter**: Filter users by online/offline status
- **User Information**: Display user details (name, email, profile pic)

### 4. UI/UX Features
- **Theme Customization**: 33+ themes via DaisyUI (light, dark, luxury, cyberpunk, synthwave, etc.) with live preview
- **Responsive Design**: Mobile-first responsive layout with adaptive sidebar (collapsed on mobile, expanded on desktop)
- **Loading States**: Skeleton loaders for messages and sidebar for better UX
- **Toast Notifications**: Non-intrusive user feedback for actions using React Hot Toast
- **Auto-scroll**: Automatic smooth scroll to latest messages
- **Image Preview**: Preview images before sending with ability to remove
- **Password Visibility**: Toggle password visibility in login/signup forms
- **Form Validation**: Client-side and server-side validation with error messages
- **Online Status Indicators**: Visual indicators (green dots) for online users
- **Auth Pattern Design**: Animated pattern background on login/signup pages

### 5. Security Features
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **HttpOnly Cookies**: Prevents XSS attacks
- **CORS Configuration**: Secure cross-origin resource sharing
- **Input Validation**: Server-side validation for all inputs
- **Protected Routes**: Middleware-based route protection

## 📊 Data Models

### User Model
```javascript
{
  email: String (required, unique),
  fullName: String (required),
  password: String (required, min: 6),
  profilePic: String (default: ''),
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  senderId: ObjectId (ref: User),
  receiverId: ObjectId (ref: User),
  text: String,
  image: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status (protected)
- `PUT /api/auth/update-profile` - Update user profile (protected)

### Message Routes (`/api/messages`)
- `GET /api/messages/users` - Get all users for sidebar (protected)
- `GET /api/messages/:id` - Get messages with a specific user (protected)
- `POST /api/messages/send/:id` - Send message to a user (protected)

## 🔄 Real-Time Communication

### Socket.IO Events

#### Client → Server
- **Connection**: Establishes connection with `userId` in query
- **Disconnect**: Removes user from online users map

#### Server → Client
- `getOnlineUsers`: Broadcasts list of online user IDs
- `newMessage`: Emits new message to receiver's socket

### Socket Implementation
- **User Socket Map**: Maps `userId` to `socketId` for direct messaging
- **Real-time Updates**: Instant message delivery to online users
- **Online Status**: Tracks user presence in real-time
- **Connection Management**: Automatic cleanup on disconnect

## 🔐 Authentication Flow

1. **Sign Up/Login**: User credentials validated and hashed password stored
2. **Token Generation**: JWT token created with 7-day expiration
3. **Cookie Setting**: HttpOnly cookie set with token
4. **Request Validation**: Middleware validates token on protected routes
5. **User Context**: Authenticated user attached to request object
6. **Auto Auth**: Token validated on app load for session persistence

## 📁 Key Components

### Backend Components

#### Controllers
- **auth.controller.js**: Handles signup, login, logout, profile update
- **message.controller.js**: Handles user listing, message retrieval, message sending

#### Middleware
- **auth.middleware.js**: JWT token validation and user authentication

#### Models
- **user.model.js**: User schema with validation
- **message.model.js**: Message schema with sender/receiver references

#### Libraries
- **db.js**: MongoDB connection utility
- **socket.js**: Socket.IO server setup and user socket mapping
- **cloudinary.js**: Cloudinary configuration for image uploads
- **utils.js**: JWT token generation utility
- **user.seed.js**: Database seeding script for test users

### Frontend Components

#### Pages
- **HomePage.jsx**: Main chat interface with sidebar and chat container
- **LoginPage.jsx**: User login form
- **SignUpPage.jsx**: User registration form
- **ProfilePage.jsx**: User profile display and update
- **SettingsPage.jsx**: Theme customization

#### Components
- **Sidebar.jsx**: User list with online status and filtering (collapsible on mobile)
- **ChatContainer.jsx**: Message display with auto-scroll and message timestamps
- **ChatHeader.jsx**: Chat header with user info and online status
- **MessageInput.jsx**: Message input with text and image support (base64 preview)
- **Navbar.jsx**: Fixed navigation bar with links to settings, profile, and logout
- **NoChatSelected.jsx**: Placeholder when no chat selected
- **AuthImagePattern.jsx**: Animated pattern background for authentication pages
- **MessageSkeleton.jsx**: Skeleton loader for messages
- **SidebarSkeleton.jsx**: Skeleton loader for sidebar

#### Stores (Zustand)
- **useAuthStore.js**: Authentication state, socket connection, online users, auth methods
- **useChatStore.js**: Messages, users, selected user, message operations, Socket.IO subscriptions
- **useThemeStore.js**: Theme state with localStorage persistence (33+ themes)

#### Utilities
- **axios.js**: Axios instance with credentials and base URL configuration
- **utils.js**: Message time formatting utility (24-hour format)

## 🚀 Deployment Considerations

### Environment Variables (Backend)
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/chatty
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
```

### Production Build
- Frontend builds to `frontend/dist`
- Backend serves static files in production
- CORS configured for production domain
- Secure cookies enabled in production

## 🎨 UI/UX Highlights

- **Theme System**: 33+ DaisyUI themes (light, dark, luxury, cyberpunk, synthwave, retro, etc.) with live preview in settings
- **Responsive Layout**: Mobile-first design with adaptive sidebar (20px on mobile, 288px on desktop)
- **Loading States**: Skeleton loaders for messages and sidebar for better perceived performance
- **Toast Notifications**: Non-intrusive user feedback using React Hot Toast
- **Auto-scroll**: Smooth scrolling to latest messages on new messages
- **Image Preview**: Base64 image preview before sending with remove option
- **Online Indicators**: Green dot indicators for online users in sidebar and chat header
- **Profile Pictures**: User avatars throughout the application with fallback image
- **Password Visibility**: Toggle password visibility in login/signup forms
- **Form Validation**: Client-side validation with visual feedback and error messages
- **Auth Pages**: Animated pattern background on login/signup pages
- **Fixed Navbar**: Sticky navbar with backdrop blur effect
- **Message Timestamps**: Formatted message timestamps in 24-hour format
- **Chat Bubbles**: Styled chat bubbles with sender/receiver differentiation
- **Image Attachments**: Image messages displayed in chat bubbles

## 🔒 Security Best Practices

1. **Password Security**: bcryptjs hashing with salt
2. **Token Security**: HttpOnly cookies prevent XSS
3. **Input Validation**: Server-side validation for all inputs
4. **CORS**: Configured for specific origins
5. **Protected Routes**: Middleware-based protection
6. **Error Handling**: Generic error messages to prevent information leakage
7. **Secure Cookies**: Secure flag in production

## 📈 Scalability Considerations

- **Database Indexing**: User email indexed for fast lookups
- **Socket Connection Pooling**: Efficient socket management
- **Message Pagination**: Can be implemented for large message histories
- **Image Optimization**: Cloudinary handles image optimization
- **State Management**: Centralized state reduces re-renders
- **Code Splitting**: Vite enables code splitting for better performance

## 🧪 Testing Considerations

- Unit tests for controllers and utilities
- Integration tests for API endpoints
- Socket.IO event testing
- Frontend component testing with React Testing Library
- E2E testing for user flows

## 🔄 Future Enhancements

- **Group Chat**: Multi-user chat rooms functionality
- **Message Read Receipts**: Track message read status
- **Typing Indicators**: Show when users are typing
- **File Sharing**: Support for documents, PDFs, and other file types
- **Message Search**: Search through message history
- **User Management**: User blocking and reporting features
- **Push Notifications**: Browser notifications for new messages
- **Voice/Video Calling**: Real-time voice and video communication
- **Message Encryption**: End-to-end encryption for messages
- **User Presence**: Advanced presence status (away, busy, etc.)
- **Message Editing/Deletion**: Edit and delete sent messages
- **Message Reactions**: Emoji reactions to messages
- **Notification Settings**: Customizable notification preferences
- **Message Pagination**: Efficient loading of large message histories
- **User Search**: Search and filter users
- **Chat History Export**: Export chat history as file
- **Message Forwarding**: Forward messages to other users

## 🧪 Development Tools

### Database Seeding
- **user.seed.js**: Seed script for creating test users with sample profile pictures
- Supports 14 test users (7 female, 7 male) with default password "123456"
- Uses randomuser.me API for profile pictures
- Useful for development and testing

### Environment Setup
- **Development**: Frontend on Vite dev server (port 5173), Backend on Express (port 5001)
- **Production**: Single server serving static files from frontend/dist
- **Environment Variables**: Separate .env files for development and production
- **CORS**: Configured for localhost:5173 in development, production domain in production

## 📝 Key Learnings & Technologies Demonstrated

1. **Real-time Communication**: Socket.IO for bidirectional communication
2. **State Management**: Zustand for efficient state management
3. **Authentication**: JWT-based authentication with secure cookies
4. **File Uploads**: Cloudinary integration for media management
5. **Database Design**: MongoDB schema design with references
6. **API Design**: RESTful API with proper error handling
7. **Security**: Password hashing, token validation, protected routes
8. **UI/UX**: Modern React patterns with Tailwind CSS
9. **Theme System**: Dynamic theme switching with persistence
10. **Responsive Design**: Mobile-first responsive layout

## 🎯 Interview Talking Points

1. **Real-time Architecture**: Explain Socket.IO implementation and user presence tracking
2. **Authentication Flow**: Describe JWT token generation, validation, and security measures
3. **State Management**: Discuss Zustand stores and their role in the application
4. **Database Design**: Explain MongoDB schema design and relationships
5. **API Design**: Discuss RESTful API structure and error handling
6. **Security**: Highlight security measures (password hashing, HttpOnly cookies, CORS)
7. **File Uploads**: Explain Cloudinary integration and image handling
8. **UI/UX**: Discuss responsive design and theme system
9. **Performance**: Mention optimization techniques (auto-scroll, loading states, etc.)
10. **Scalability**: Discuss potential improvements and scaling strategies

## 📚 Dependencies Summary

### Backend Dependencies
- express: Web framework
- mongoose: MongoDB ODM
- socket.io: Real-time communication
- jsonwebtoken: JWT token generation
- bcryptjs: Password hashing
- cloudinary: Image upload service
- cookie-parser: Cookie parsing middleware
- cors: CORS middleware
- dotenv: Environment variable management

### Frontend Dependencies
- react: UI library
- react-router-dom: Routing
- zustand: State management
- axios: HTTP client
- socket.io-client: Socket.IO client
- tailwindcss: CSS framework
- daisyui: Tailwind component library
- lucide-react: Icon library
- react-hot-toast: Toast notifications

---

**Project Status**: Production-ready chat application with real-time messaging, user authentication, and modern UI/UX.

**Last Updated**: 2024

