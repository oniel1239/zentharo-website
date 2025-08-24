# Zentharo Software Solutions - Request Management System

This is a professional request management system with MongoDB integration for Zentharo Software Solutions.

## Features

- Submit project requests through the main website
- View and manage requests on the dedicated Requests page
- User authentication (login/register)
- Profile management (change name and password)
- Professional backend with MongoDB storage
- Responsive design that works on all devices

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd zentharo-requests
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Set up MongoDB:
   - Install MongoDB locally or use a cloud service like MongoDB Atlas
   - Update the `MONGODB_URI` in the `.env` file with your MongoDB connection string

5. Start the server:
   ```
   npm start
   ```

   For development with auto-restart:
   ```
   npm run dev
   ```

## Project Structure

- `index.html` - Main website page
- `login.html` - User login page
- `register.html` - User registration page
- `request-approval.html` - Request management page
- `profile.html` - User profile management page
- `script.js` - Client-side JavaScript for handling requests
- `styles.css` - Styling for all pages
- `server.js` - Backend server with MongoDB integration
- `package.json` - Project dependencies and scripts
- `.env` - Environment variables

## API Endpoints

### Request Management
- `POST /api/requests` - Create a new request
- `GET /api/requests` - Get all requests
- `GET /api/requests/:id` - Get a specific request
- `PUT /api/requests/:id` - Update a request
- `DELETE /api/requests/:id` - Delete a request

### User Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user

### Profile Management
- `PUT /api/user/name` - Update user name
- `PUT /api/user/password` - Update user password

## How It Works

1. Users register or login to access the system
2. Users submit requests through the form on `index.html`
3. Requests are saved to MongoDB via the backend API
4. Users can view their requests on `request-approval.html`
5. Users can manage their profile on `profile.html`

## Security Features

- Passwords are hashed using bcrypt
- Authentication using JWT tokens
- Protected routes that require authentication
- Secure password change with current password verification

## Fallback Mechanism

If the backend API is unavailable, the system will automatically fall back to localStorage for saving and retrieving requests, ensuring users never lose their data.

## Customization

You can customize the following environment variables in the `.env` file:

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation

## License

This project is licensed under the MIT License.