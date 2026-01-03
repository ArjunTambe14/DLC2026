"""
Database module for Byte-Sized Business Boost
Handles all data storage and retrieval operations
"""
import json
import sqlite3
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional


class Database:
    """Centralized database handler for the application"""

    def __init__(self):
        self.conn = sqlite3.connect('business.db', check_same_thread=False)
        self.create_tables()
        self.load_initial_data()

    def create_tables(self):
        """Create all necessary database tables"""
        cursor = self.conn.cursor()

        # Businesses table
        cursor.execute('''
                       CREATE TABLE IF NOT EXISTS businesses (
                                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                 name TEXT NOT NULL,
                                                                 category TEXT NOT NULL,
                                                                 address TEXT,
                                                                 phone TEXT,
                                                                 email TEXT,
                                                                 description TEXT,
                                                                 rating REAL DEFAULT 0,
                                                                 review_count INTEGER DEFAULT 0,
                                                                 deals TEXT,
                                                                 latitude REAL,
                                                                 longitude REAL,
                                                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                       )
                       ''')

        # Reviews table
        cursor.execute('''
                       CREATE TABLE IF NOT EXISTS reviews (
                                                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                              business_id INTEGER,
                                                              user_id INTEGER,
                                                              rating INTEGER CHECK(rating >= 1 AND rating <= 5),
                           comment TEXT,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           FOREIGN KEY (business_id) REFERENCES businesses (id),
                           FOREIGN KEY (user_id) REFERENCES users (id)
                           )
                       ''')

        # Users table
        cursor.execute('''
                       CREATE TABLE IF NOT EXISTS users (
                                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                            username TEXT UNIQUE NOT NULL,
                                                            password_hash TEXT NOT NULL,
                                                            email TEXT,
                                                            favorites TEXT DEFAULT '[]',
                                                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                       )
                       ''')

        # Bookmarks table
        cursor.execute('''
                       CREATE TABLE IF NOT EXISTS bookmarks (
                                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                user_id INTEGER,
                                                                business_id INTEGER,
                                                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                                FOREIGN KEY (user_id) REFERENCES users (id),
                           FOREIGN KEY (business_id) REFERENCES businesses (id),
                           UNIQUE(user_id, business_id)
                           )
                       ''')

        self.conn.commit()

    def load_initial_data(self):
        """Load initial sample data if no businesses exist"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM businesses")
        count = cursor.fetchone()[0]

        if count == 0:
            sample_businesses = [
                {
                    'name': 'Java Junction Cafe',
                    'category': 'food',
                    'address': '123 Main St, Cityville',
                    'phone': '(555) 123-4567',
                    'email': 'contact@javajunction.com',
                    'description': 'Cozy coffee shop with artisanal brews and pastries',
                    'rating': 4.5,
                    'review_count': 128,
                    'deals': 'Buy 5 coffees, get 1 free',
                    'latitude': 40.7128,
                    'longitude': -74.0060
                },
                {
                    'name': 'Tech Haven',
                    'category': 'retail',
                    'address': '456 Tech Blvd, Cityville',
                    'phone': '(555) 987-6543',
                    'email': 'support@techhaven.com',
                    'description': 'Electronics and computer accessories store',
                    'rating': 4.2,
                    'review_count': 89,
                    'deals': '10% off on weekends for students',
                    'latitude': 40.7589,
                    'longitude': -73.9851
                },
                {
                    'name': 'Green Thumb Landscaping',
                    'category': 'services',
                    'address': '789 Garden Way, Cityville',
                    'phone': '(555) 456-7890',
                    'email': 'service@greenthumb.com',
                    'description': 'Professional landscaping and garden maintenance',
                    'rating': 4.8,
                    'review_count': 67,
                    'deals': 'Free consultation for first-time customers',
                    'latitude': 40.7505,
                    'longitude': -73.9934
                }
            ]

            for business in sample_businesses:
                cursor.execute('''
                               INSERT INTO businesses
                               (name, category, address, phone, email, description, rating, review_count, deals, latitude, longitude)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                               ''', (
                                   business['name'], business['category'], business['address'],
                                   business['phone'], business['email'], business['description'],
                                   business['rating'], business['review_count'], business['deals'],
                                   business['latitude'], business['longitude']
                               ))

            self.conn.commit()

    def get_businesses(self, category=None, sort_by='name', search_term=None, min_rating=0):
        """Retrieve businesses with optional filtering and sorting"""
        cursor = self.conn.cursor()

        query = "SELECT * FROM businesses WHERE 1=1"
        params = []

        if category and category != 'all':
            query += " AND category = ?"
            params.append(category)

        if search_term:
            query += " AND (name LIKE ? OR description LIKE ?)"
            params.extend([f'%{search_term}%', f'%{search_term}%'])

        if min_rating > 0:
            query += " AND rating >= ?"
            params.append(min_rating)

        if sort_by == 'rating':
            query += " ORDER BY rating DESC"
        elif sort_by == 'name':
            query += " ORDER BY name"
        elif sort_by == 'review_count':
            query += " ORDER BY review_count DESC"

        cursor.execute(query, params)
        columns = [desc[0] for desc in cursor.description]
        businesses = [dict(zip(columns, row)) for row in cursor.fetchall()]

        return businesses

    def add_review(self, business_id, user_id, rating, comment):
        """Add a new review and update business rating"""
        cursor = self.conn.cursor()

        # Add review
        cursor.execute('''
                       INSERT INTO reviews (business_id, user_id, rating, comment)
                       VALUES (?, ?, ?, ?)
                       ''', (business_id, user_id, rating, comment))

        # Update business rating
        cursor.execute('''
                       UPDATE businesses
                       SET rating = (
                           SELECT AVG(rating) FROM reviews WHERE business_id = ?
                       ),
                           review_count = (
                               SELECT COUNT(*) FROM reviews WHERE business_id = ?
                           )
                       WHERE id = ?
                       ''', (business_id, business_id, business_id))

        self.conn.commit()
        return cursor.lastrowid

    def add_user(self, username, password, email):
        """Register a new user"""
        cursor = self.conn.cursor()
        password_hash = hashlib.sha256(password.encode()).hexdigest()

        try:
            cursor.execute('''
                           INSERT INTO users (username, password_hash, email)
                           VALUES (?, ?, ?)
                           ''', (username, password_hash, email))
            self.conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            return None

    def authenticate_user(self, username, password):
        """Authenticate user login"""
        cursor = self.conn.cursor()
        password_hash = hashlib.sha256(password.encode()).hexdigest()

        cursor.execute('''
                       SELECT id, username, email FROM users
                       WHERE username = ? AND password_hash = ?
                       ''', (username, password_hash))

        result = cursor.fetchone()
        if result:
            return {'id': result[0], 'username': result[1], 'email': result[2]}
        return None

    def toggle_bookmark(self, user_id, business_id):
        """Toggle bookmark for a business"""
        cursor = self.conn.cursor()

        # Check if already bookmarked
        cursor.execute('''
                       SELECT id FROM bookmarks
                       WHERE user_id = ? AND business_id = ?
                       ''', (user_id, business_id))

        if cursor.fetchone():
            # Remove bookmark
            cursor.execute('''
                           DELETE FROM bookmarks
                           WHERE user_id = ? AND business_id = ?
                           ''', (user_id, business_id))
            action = 'removed'
        else:
            # Add bookmark
            cursor.execute('''
                           INSERT INTO bookmarks (user_id, business_id)
                           VALUES (?, ?)
                           ''', (user_id, business_id))
            action = 'added'

        self.conn.commit()
        return action

    def get_bookmarks(self, user_id):
        """Get user's bookmarked businesses"""
        cursor = self.conn.cursor()
        cursor.execute('''
                       SELECT b.* FROM businesses b
                                           JOIN bookmarks bk ON b.id = bk.business_id
                       WHERE bk.user_id = ?
                       ORDER BY bk.created_at DESC
                       ''', (user_id,))

        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]

    def get_user_reviews(self, user_id):
        """Get reviews by a specific user"""
        cursor = self.conn.cursor()
        cursor.execute('''
                       SELECT r.*, b.name as business_name FROM reviews r
                                                                    JOIN businesses b ON r.business_id = b.id
                       WHERE r.user_id = ?
                       ORDER BY r.created_at DESC
                       ''', (user_id,))

        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]

    def get_statistics(self):
        """Get application statistics"""
        cursor = self.conn.cursor()

        stats = {}

        # Total businesses
        cursor.execute("SELECT COUNT(*) FROM businesses")
        stats['total_businesses'] = cursor.fetchone()[0]

        # Businesses by category
        cursor.execute("SELECT category, COUNT(*) FROM businesses GROUP BY category")
        stats['by_category'] = dict(cursor.fetchall())

        # Average rating
        cursor.execute("SELECT AVG(rating) FROM businesses")
        stats['avg_rating'] = cursor.fetchone()[0] or 0

        # Total reviews
        cursor.execute("SELECT COUNT(*) FROM reviews")
        stats['total_reviews'] = cursor.fetchone()[0]

        # Top rated businesses
        cursor.execute("SELECT name, rating FROM businesses ORDER BY rating DESC LIMIT 5")
        stats['top_rated'] = cursor.fetchall()

        return stats

    def close(self):
        """Close database connection"""
        self.conn.close()