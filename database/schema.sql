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
    comment TEXT,
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
('Sharma Electronics & Mobile', 'contact@sharmaelectronics.in', 'Shop No. 15, Nehru Place Market, New Delhi - 110019'),
('Patel Fresh Vegetables', 'info@patelfresh.com', '42, Gandhi Road, Ahmedabad, Gujarat - 380001'),
('Gupta Fashion Boutique', 'hello@guptafashion.in', '78, Commercial Street, Bangalore, Karnataka - 560001'),
('Agarwal Book Store', 'books@agarwalbooks.com', '23, Connaught Place, New Delhi - 110001'),
('Chai Wala Corner', 'orders@chaiwala.in', '156, MG Road, Pune, Maharashtra - 411001');

-- Insert sample users for testing
INSERT INTO users (name, email, password, address, role) VALUES 
('Rajesh Kumar Singh', 'rajesh@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'A-204, Sector 15, Noida, Uttar Pradesh - 201301', 'user'),
('Priya Sharma Gupta', 'priya@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'B-45, Koramangala, Bangalore, Karnataka - 560034', 'user'),
('Amit Patel Store Owner', 'amit@storeowner.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Shop 12, Satellite Road, Ahmedabad, Gujarat - 380015', 'store_owner');

-- Update stores to have owners
UPDATE stores SET owner_id = (SELECT id FROM users WHERE email = 'amit@storeowner.com' LIMIT 1) WHERE id = 1;

-- Insert sample ratings
INSERT INTO ratings (user_id, store_id, rating) VALUES 
((SELECT id FROM users WHERE email = 'rajesh@example.com'), 1, 5),
((SELECT id FROM users WHERE email = 'priya@example.com'), 1, 4),
((SELECT id FROM users WHERE email = 'rajesh@example.com'), 2, 3),
((SELECT id FROM users WHERE email = 'priya@example.com'), 2, 5),
((SELECT id FROM users WHERE email = 'rajesh@example.com'), 3, 4);
