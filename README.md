# WhatsApp Clone - Real-time Chat App

A modern, production-ready WhatsApp clone built with the MERN stack.

## Features
- **Real-time Messaging**: Powered by Socket.IO for instant communication.
- **Authentication**: Secure JWT-based auth with bcrypt password hashing.
- **Media Sharing**: Upload and share images via Cloudinary.
- **Online/Offline Status**: Real-time presence tracking.
- **Responsive Design**: WhatsApp-like premium UI with dark mode components.

## Tech Stack
- **Frontend**: React, Lucide-React, Axios, Socket.IO Client.
- **Backend**: Node.js, Express, Socket.IO, Mongoose.
- **Database**: MongoDB.
- **Media**: Cloudinary.

## Setup Instructions

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies: `npm install`.
3. Create a `.env` file based on `.env.example`.
4. Run the server: `npm run dev` (starts with nodemon).

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`.
3. Run the development server: `npm run dev`.

## Environment Variables (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Usage
- **Register/Login**: Start by creating an account.
- **New Chat**: Click the message icon in the sidebar to search for users and start a chat.
- **Media**: Click the paperclip icon to upload and send images.
