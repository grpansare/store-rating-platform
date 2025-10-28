-- Create database
CREATE DATABASE IF NOT EXISTS store_rating_db;
USE store_rating_db;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address TEXT,
    role ENUM('admin', 'user', 'store_owner') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Stores table
CREATE TABLE stores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    owner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_email (email),
    INDEX idx_owner (owner_id)
);

-- Ratings table
CREATE TABLE ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_store_rating (user_id, store_id),
    INDEX idx_store (store_id),
    INDEX idx_user (user_id),
    INDEX idx_rating (rating)
);

-- Create view for store ratings with average
CREATE VIEW store_ratings_view AS
SELECT 
    s.id,
    s.name,
    s.email,
    s.address,
    s.owner_id,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COUNT(r.id) as total_ratings
FROM stores s
LEFT JOIN ratings r ON s.id = r.store_id
GROUP BY s.id, s.name, s.email, s.address, s.owner_id;

-- Insert default admin user
INSERT INTO users (name, email, password, address, role) VALUES 
('System Administrator', 'admin@storerating.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Address', 'admin');

-- Insert sample stores for testing
INSERT INTO stores (name, email, address) VALUES 
('Tech Store Central', 'contact@techstore.com', '123 Tech Street, Silicon Valley, CA 94000'),
('Green Grocery Market', 'info@greengrocery.com', '456 Fresh Avenue, Organic City, NY 10001'),
('Fashion Hub Boutique', 'hello@fashionhub.com', '789 Style Boulevard, Fashion District, LA 90210'),
('Book Haven Library', 'books@bookhaven.com', '321 Reading Lane, Literary Town, TX 75001'),
('Coffee Corner Cafe', 'brew@coffeecorner.com', '654 Bean Street, Caffeine City, WA 98001');

-- Insert sample users for testing
INSERT INTO users (name, email, password, address, role) VALUES 
('John Smith Customer', 'john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '100 Customer Street, User City, CA 90000', 'user'),
('Jane Doe Customer', 'jane@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '200 Buyer Avenue, Shopping Town, NY 10000', 'user'),
('Store Owner Mike', 'mike@storeowner.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '300 Business Road, Commerce City, TX 70000', 'store_owner');

-- Update stores to have owners
UPDATE stores SET owner_id = (SELECT id FROM users WHERE email = 'mike@storeowner.com' LIMIT 1) WHERE id = 1;

-- Insert sample ratings
INSERT INTO ratings (user_id, store_id, rating) VALUES 
((SELECT id FROM users WHERE email = 'john@example.com'), 1, 5),
((SELECT id FROM users WHERE email = 'jane@example.com'), 1, 4),
((SELECT id FROM users WHERE email = 'john@example.com'), 2, 3),
((SELECT id FROM users WHERE email = 'jane@example.com'), 2, 5),
((SELECT id FROM users WHERE email = 'john@example.com'), 3, 4);
