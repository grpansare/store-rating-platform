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

## 🔒 Security Features

### Authentication & Authorization
- 🔐 **JWT Authentication**: Secure token-based authentication
- 🔒 **Password Hashing**: bcrypt with salt rounds for secure password storage
- 👥 **Role-Based Access**: Granular permissions for different user types
- ⏱️ **Token Expiration**: Automatic session management

### API Security
- 🚫 **Rate Limiting**: Prevent API abuse and DDoS attacks
- 🌐 **CORS Protection**: Configured cross-origin resource sharing
- 🛡️ **Helmet.js**: Security headers for XSS, clickjacking protection
- ✅ **Input Validation**: Comprehensive data validation and sanitization
- 📝 **SQL Injection Prevention**: Parameterized queries and ORM protection

### Data Protection
- 🔍 **Environment Variables**: Sensitive data stored securely
- 📊 **Audit Logging**: Track user actions and system events
- 🔄 **Data Backup**: Regular database backup recommendations

## 🛠️ Development

### Available Scripts

#### Backend Commands
```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run database migrations
npm run migrate

# Seed database with sample data
npm run seed
```

#### Frontend Commands
```bash
cd client

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Development Workflow
1. **Feature Development**: Create feature branches from `main`
2. **Code Quality**: Use ESLint and Prettier for consistent code style
3. **Testing**: Write unit tests for new features
4. **Documentation**: Update API documentation for new endpoints
5. **Review**: Submit pull requests for code review

### Project Structure
```
store-rating-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   └── assets/         # Static assets
│   └── public/             # Public files
├── config/                # Configuration files
├── database/              # Database schema and migrations
├── middleware/            # Express middleware
├── routes/                # API routes
└── server.js              # Main server file
```

## 🚀 Deployment

### Production Deployment

#### 1. Server Setup
```bash
# Clone repository on server
git clone https://github.com/grpansare/store-rating-platform.git
cd store-rating-platform

# Install dependencies
npm install
cd client && npm install && cd ..
```

#### 2. Environment Configuration
```bash
# Create production environment file
cp .env.example .env.production

# Update production settings
NODE_ENV=production
DB_HOST=your_production_db_host
JWT_SECRET=your_super_secure_production_secret
```

#### 3. Build & Deploy
```bash
# Build frontend
cd client && npm run build && cd ..

# Start with PM2 (recommended)
npm install -g pm2
pm2 start ecosystem.config.js

# Or start directly
npm start
```

#### 4. Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Getting Started
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/grpansare/store-rating-platform.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Install** dependencies: `npm install`

### Development Guidelines
- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### Submitting Changes
1. **Commit** your changes: `git commit -m 'Add amazing feature'`
2. **Push** to your branch: `git push origin feature/amazing-feature`
3. **Submit** a Pull Request with a clear description

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project's coding standards

