# Store Rating Application

A full-stack web application for store ratings with role-based access control.

## Tech Stack

- **Backend**: Express.js
- **Database**: MySQL
- **Frontend**: React.js
- **Authentication**: JWT tokens

## Features

### User Roles
1. **System Administrator** - Full system management
2. **Normal User** - Rate stores and manage profile
3. **Store Owner** - View store analytics and ratings

### Functionalities

#### System Administrator
- Add new stores, users, and admin users
- Dashboard with statistics (total users, stores, ratings)
- Manage users and stores with full CRUD operations
- Filter and sort all listings
- View detailed user and store information

#### Normal User
- Sign up and login
- Update password
- View and search stores
- Submit and modify ratings (1-5 scale)
- View personal rating history

#### Store Owner
- Login and password management
- View store rating analytics
- See users who rated their store
- View average store rating

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd store-rating-app
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Set up MySQL database**
   - Create a MySQL database
   - Update `.env` file with your database credentials
   - Run the schema file to create tables:
   ```bash
   mysql -u your_username -p your_database < database/schema.sql
   ```

4. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the following variables:
     - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
     - `JWT_SECRET` (use a strong secret key)
     - `ADMIN_EMAIL`, `ADMIN_PASSWORD`

5. **Start the backend server**
   ```bash
   npm run dev
   ```

6. **Install and start frontend** (after React setup)
   ```bash
   cd client
   npm install
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/password` - Update password
- `GET /api/auth/verify` - Verify token

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/dashboard/stats` - Get dashboard statistics

### Stores
- `GET /api/stores` - Get all stores
- `GET /api/stores/:id` - Get store by ID
- `POST /api/stores` - Create store (Admin only)
- `PUT /api/stores/:id` - Update store (Admin only)
- `DELETE /api/stores/:id` - Delete store (Admin only)
- `GET /api/stores/:id/ratings` - Get store ratings
- `GET /api/stores/dashboard/stats` - Get store owner dashboard statistics

### Ratings
- `POST /api/ratings` - Submit/update rating
- `GET /api/ratings/store/:store_id` - Get user's rating for store
- `GET /api/ratings/my-ratings` - Get all user's ratings
- `DELETE /api/ratings/store/:store_id` - Delete rating

## Form Validations

- **Name**: 20-60 characters
- **Address**: Max 400 characters
- **Password**: 8-16 characters, must include uppercase letter and special character
- **Email**: Standard email validation
- **Rating**: Integer between 1-5

## Default Credentials

- **Admin**: admin@storerating.com / Admin@123
- **Test User**: john@example.com / password
- **Store Owner**: mike@storeowner.com / password

## Database Schema

### Users Table
- id, name, email, password, address, role, timestamps

### Stores Table
- id, name, email, address, owner_id, timestamps

### Ratings Table
- id, user_id, store_id, rating, timestamps
- Unique constraint on (user_id, store_id)

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization

## Development

```bash
# Start backend in development mode
npm run dev

# Start frontend (after setup)
npm run client

# Build for production
npm run build
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Update CORS origins in server.js
3. Build React frontend
4. Configure reverse proxy (nginx recommended)
5. Use process manager (PM2 recommended)

## License

MIT License
