-- Seed data for Farm2City platform

-- Insert sample users
INSERT INTO users (id, name, email, role, location, phone, bio) VALUES
-- Farmers
('550e8400-e29b-41d4-a716-446655440001', 'Rajesh Kumar', 'rajesh@example.com', 'farmer', 'Punjab, India', '+91-9876543210', 'Organic farmer with 15 years of experience in growing fresh vegetables'),
('550e8400-e29b-41d4-a716-446655440002', 'Priya Sharma', 'priya@example.com', 'farmer', 'Maharashtra, India', '+91-9876543211', 'Specializes in seasonal fruits and organic farming practices'),
('550e8400-e29b-41d4-a716-446655440003', 'Suresh Patel', 'suresh@example.com', 'farmer', 'Gujarat, India', '+91-9876543212', 'Grain and pulse farmer with modern farming techniques'),
('550e8400-e29b-41d4-a716-446655440004', 'Meera Singh', 'meera@example.com', 'farmer', 'Rajasthan, India', '+91-9876543213', 'Herb and spice specialist with sustainable farming methods'),

-- Traders
('550e8400-e29b-41d4-a716-446655440005', 'Amit Verma', 'amit@example.com', 'trader', 'Delhi, India', '+91-9876543214', 'Wholesale trader specializing in fresh produce distribution'),
('550e8400-e29b-41d4-a716-446655440006', 'Sunita Gupta', 'sunita@example.com', 'trader', 'Mumbai, India', '+91-9876543215', 'Bulk trader with 20 years of experience in agricultural commodities'),

-- Shopkeepers
('550e8400-e29b-41d4-a716-446655440007', 'Ravi Kumar', 'ravi@example.com', 'shopkeeper', 'Bangalore, India', '+91-9876543216', 'Local grocery store owner serving the community for 10 years'),
('550e8400-e29b-41d4-a716-446655440008', 'Kavita Reddy', 'kavita@example.com', 'shopkeeper', 'Hyderabad, India', '+91-9876543217', 'Organic food store owner promoting healthy eating'),
('550e8400-e29b-41d4-a716-446655440009', 'Vikram Joshi', 'vikram@example.com', 'shopkeeper', 'Pune, India', '+91-9876543218', 'Neighborhood store with focus on fresh and local produce');

-- Insert sample products
INSERT INTO products (farmer_id, name, price, quantity, category, unit, description, harvest_date, expiry_date) VALUES
-- Rajesh Kumar's products
('550e8400-e29b-41d4-a716-446655440001', 'Organic Tomatoes', 45.00, 100, 'Vegetables', 'kg', 'Fresh organic tomatoes, perfect for salads and cooking', '2024-01-15', '2024-01-25'),
('550e8400-e29b-41d4-a716-446655440001', 'Green Bell Peppers', 60.00, 50, 'Vegetables', 'kg', 'Crisp green bell peppers, great for stir-fries', '2024-01-14', '2024-01-24'),
('550e8400-e29b-41d4-a716-446655440001', 'Cucumbers', 35.00, 80, 'Vegetables', 'kg', 'Fresh cucumbers, ideal for salads and pickling', '2024-01-13', '2024-01-23'),

-- Priya Sharma's products
('550e8400-e29b-41d4-a716-446655440002', 'Fresh Mangoes', 80.00, 60, 'Fruits', 'kg', 'Sweet and juicy Alphonso mangoes', '2024-01-12', '2024-01-22'),
('550e8400-e29b-41d4-a716-446655440002', 'Bananas', 25.00, 120, 'Fruits', 'kg', 'Fresh yellow bananas, perfect for daily consumption', '2024-01-11', '2024-01-21'),
('550e8400-e29b-41d4-a716-446655440002', 'Oranges', 50.00, 90, 'Fruits', 'kg', 'Sweet and tangy oranges, rich in Vitamin C', '2024-01-10', '2024-01-20'),

-- Suresh Patel's products
('550e8400-e29b-41d4-a716-446655440003', 'Basmati Rice', 120.00, 200, 'Grains', 'kg', 'Premium quality basmati rice, aged for perfect texture', '2024-01-09', '2025-01-09'),
('550e8400-e29b-41d4-a716-446655440003', 'Wheat Flour', 40.00, 150, 'Grains', 'kg', 'Whole wheat flour, freshly milled', '2024-01-08', '2024-07-08'),
('550e8400-e29b-41d4-a716-446655440003', 'Moong Dal', 85.00, 100, 'Pulses', 'kg', 'Split green gram dal, high in protein', '2024-01-07', '2024-12-07'),

-- Meera Singh's products
('550e8400-e29b-41d4-a716-446655440004', 'Turmeric Powder', 200.00, 25, 'Spices', 'kg', 'Pure turmeric powder, hand-ground from fresh rhizomes', '2024-01-06', '2025-01-06'),
('550e8400-e29b-41d4-a716-446655440004', 'Cumin Seeds', 150.00, 30, 'Spices', 'kg', 'Aromatic cumin seeds, perfect for tempering', '2024-01-05', '2025-01-05'),
('550e8400-e29b-41d4-a716-446655440004', 'Fresh Coriander', 30.00, 40, 'Herbs', 'kg', 'Fresh coriander leaves, great for garnishing', '2024-01-04', '2024-01-11');

-- Insert sample orders
INSERT INTO orders (trader_id, farmer_id, product_id, quantity, status, total_amount, notes, delivery_date) VALUES
-- Amit Verma's orders
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 
 (SELECT id FROM products WHERE name = 'Organic Tomatoes' LIMIT 1), 
 50, 'confirmed', 2250.00, 'Need delivery by weekend', '2024-01-20'),

('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 
 (SELECT id FROM products WHERE name = 'Fresh Mangoes' LIMIT 1), 
 30, 'pending', 2400.00, 'Please ensure good quality', '2024-01-18'),

-- Sunita Gupta's orders
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 
 (SELECT id FROM products WHERE name = 'Basmati Rice' LIMIT 1), 
 100, 'delivered', 12000.00, 'Excellent quality rice', '2024-01-10'),

('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', 
 (SELECT id FROM products WHERE name = 'Turmeric Powder' LIMIT 1), 
 10, 'confirmed', 2000.00, 'Bulk order for retail distribution', '2024-01-22');

-- Insert sample shopkeeper orders
INSERT INTO orders (trader_id, farmer_id, product_id, quantity, status, total_amount, notes, delivery_date) VALUES
-- Ravi Kumar's orders
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 
 (SELECT id FROM products WHERE name = 'Green Bell Peppers' LIMIT 1), 
 10, 'confirmed', 600.00, 'Regular weekly order', '2024-01-19'),

('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 
 (SELECT id FROM products WHERE name = 'Bananas' LIMIT 1), 
 20, 'delivered', 500.00, 'Fresh bananas for customers', '2024-01-15'),

-- Kavita Reddy's orders
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', 
 (SELECT id FROM products WHERE name = 'Fresh Coriander' LIMIT 1), 
 5, 'pending', 150.00, 'Need for organic section', '2024-01-17'),

('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 
 (SELECT id FROM products WHERE name = 'Organic Tomatoes' LIMIT 1), 
 15, 'confirmed', 675.00, 'Organic section requirement', '2024-01-21');

-- Insert sample chat messages
INSERT INTO chats (sender_id, receiver_id, message, order_id) VALUES
-- Chat between Amit and Rajesh about tomato order
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 
 'Hi Rajesh, I need 50kg of your organic tomatoes for this weekend. Can you confirm availability?', 
 (SELECT id FROM orders WHERE notes LIKE '%Need delivery by weekend%' LIMIT 1)),

('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 
 'Hello Amit! Yes, I have 50kg available. I can deliver by Saturday. The quality is excellent this week.', 
 (SELECT id FROM orders WHERE notes LIKE '%Need delivery by weekend%' LIMIT 1)),

-- Chat between Sunita and Suresh about rice order
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 
 'Suresh, your basmati rice quality was exceptional. Can we schedule another 100kg order?', 
 (SELECT id FROM orders WHERE notes LIKE '%Excellent quality rice%' LIMIT 1)),

('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', 
 'Thank you Sunita! I can arrange 100kg for next week. The same premium quality.', 
 (SELECT id FROM orders WHERE notes LIKE '%Excellent quality rice%' LIMIT 1));

-- Insert sample reviews
INSERT INTO reviews (shopkeeper_id, farmer_id, rating, comment, order_id) VALUES
-- Ravi's review for Rajesh
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 
 5, 'Excellent quality vegetables. Always fresh and reasonably priced. Highly recommended!', 
 (SELECT id FROM orders WHERE notes LIKE '%Regular weekly order%' LIMIT 1)),

-- Kavita's review for Meera
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', 
 4, 'Great quality spices and herbs. Very reliable farmer with organic practices.', 
 (SELECT id FROM orders WHERE notes LIKE '%Organic section requirement%' LIMIT 1)),

-- Ravi's review for Priya
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 
 5, 'Amazing fruits! The bananas were perfect and customers loved them.', 
 (SELECT id FROM orders WHERE notes LIKE '%Fresh bananas for customers%' LIMIT 1));

-- Insert sample wishlist items
INSERT INTO wishlists (user_id, product_id) VALUES
-- Amit's wishlist
('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM products WHERE name = 'Fresh Mangoes' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM products WHERE name = 'Basmati Rice' LIMIT 1)),

-- Ravi's wishlist
('550e8400-e29b-41d4-a716-446655440007', (SELECT id FROM products WHERE name = 'Organic Tomatoes' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440007', (SELECT id FROM products WHERE name = 'Fresh Coriander' LIMIT 1)),

-- Kavita's wishlist
('550e8400-e29b-41d4-a716-446655440008', (SELECT id FROM products WHERE name = 'Turmeric Powder' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440008', (SELECT id FROM products WHERE name = 'Cumin Seeds' LIMIT 1));

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, data) VALUES
-- Notifications for farmers
('550e8400-e29b-41d4-a716-446655440001', 'New Order Received', 'Amit Verma placed an order for 50kg Organic Tomatoes', 'order', '{"order_id": "sample-order-1"}'),
('550e8400-e29b-41d4-a716-446655440002', 'New Order Received', 'Amit Verma placed an order for 30kg Fresh Mangoes', 'order', '{"order_id": "sample-order-2"}'),

-- Notifications for traders/shopkeepers
('550e8400-e29b-41d4-a716-446655440005', 'Order Confirmed', 'Your order for Organic Tomatoes has been confirmed by Rajesh Kumar', 'order', '{"order_id": "sample-order-1"}'),
('550e8400-e29b-41d4-a716-446655440007', 'New Message', 'You have a new message from Rajesh Kumar', 'chat', '{"sender_id": "550e8400-e29b-41d4-a716-446655440001"}'),

-- Notifications for shopkeepers
('550e8400-e29b-41d4-a716-446655440008', 'Low Stock Alert', 'Fresh Coriander stock is running low (5kg remaining)', 'system', '{"product_id": "sample-product-1", "current_stock": 5}');

-- Insert sample inventory for shopkeepers
INSERT INTO inventory (shopkeeper_id, product_id, quantity_in, quantity_out, current_stock) VALUES
-- Ravi's inventory
('550e8400-e29b-41d4-a716-446655440007', (SELECT id FROM products WHERE name = 'Green Bell Peppers' LIMIT 1), 10, 8, 2),
('550e8400-e29b-41d4-a716-446655440007', (SELECT id FROM products WHERE name = 'Bananas' LIMIT 1), 20, 18, 2),

-- Kavita's inventory
('550e8400-e29b-41d4-a716-446655440008', (SELECT id FROM products WHERE name = 'Organic Tomatoes' LIMIT 1), 15, 10, 5),
('550e8400-e29b-41d4-a716-446655440008', (SELECT id FROM products WHERE name = 'Fresh Coriander' LIMIT 1), 5, 0, 5);

-- Insert sample auto-reorder settings
INSERT INTO auto_reorder_settings (shopkeeper_id, product_id, min_stock, reorder_quantity, frequency, enabled) VALUES
-- Ravi's auto-reorder settings
('550e8400-e29b-41d4-a716-446655440007', (SELECT id FROM products WHERE name = 'Green Bell Peppers' LIMIT 1), 5, 10, 'weekly', true),
('550e8400-e29b-41d4-a716-446655440007', (SELECT id FROM products WHERE name = 'Bananas' LIMIT 1), 10, 20, 'daily', true),

-- Kavita's auto-reorder settings
('550e8400-e29b-41d4-a716-446655440008', (SELECT id FROM products WHERE name = 'Organic Tomatoes' LIMIT 1), 8, 15, 'weekly', true),
('550e8400-e29b-41d4-a716-446655440008', (SELECT id FROM products WHERE name = 'Fresh Coriander' LIMIT 1), 3, 5, 'daily', true);



