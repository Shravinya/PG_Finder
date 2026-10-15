#!/usr/bin/env python3
"""Script to add a new admin account to the database."""

import sqlite3
import os
from passlib.context import CryptContext

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(DB_DIR, "pg_agent.db")

# Initialize password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def add_admin(email: str, password: str, name: str = "Admin") -> bool:
    """Add a new admin account to the database."""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # Check if admin already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone() is not None:
            print(f"❌ Admin with email {email} already exists!")
            conn.close()
            return False
        
        # Hash password and insert
        password_hash = pwd_context.hash(password)
        cursor.execute("""
            INSERT INTO users (email, password_hash, name, role, is_active)
            VALUES (?, ?, ?, 'admin', 1)
        """, (email, password_hash, name))
        
        conn.commit()
        conn.close()
        
        print(f"✅ Admin account created successfully!")
        print(f"   Email: {email}")
        print(f"   Name: {name}")
        print(f"   Role: admin")
        return True
        
    except Exception as e:
        print(f"❌ Error adding admin: {e}")
        return False


if __name__ == "__main__":
    # Add the new admin account
    add_admin(
        email="pg_finder@gmail.com",
        password="Ammu@720",
        name="PG Finder Admin"
    )
