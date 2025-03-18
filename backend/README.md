# Product Catalog Service - Backend

This is the Flask-based backend for the Product Catalog Service. It provides authentication and product management APIs.

## Features

- User authentication (JWT/session-based)
- CRUD operations for products
- SQLite for data storage

## Tech Stack

- **Flask**: Web framework
- **SQLite**: Database
- **JWT**: Authentication
- **Flask-CORS**: Cross-origin support

## Database Schema

The backend uses **SQLite** as the database. Below are the main tables:

### **Users Table**
| Column  | Type    | Description               |
|---------|--------|---------------------------|
| `id`    | INTEGER (PK) | Unique user ID      |
| `email` | TEXT (Unique) | User email         |
| `name`  | TEXT   | Full name of the user    |
| `password` | TEXT | Hashed password        |

### **Products Table**
| Column       | Type   | Description                     |
|-------------|--------|---------------------------------|
| `id`        | INTEGER (PK) | Unique product ID        |
| `name`      | TEXT   | Name of the product/service   |
| `category`  | TEXT   | Category of the product       |
| `price`     | REAL   | Price of the product         |
| `image_url` | TEXT   | URL of product image         |
| `description` | TEXT | Short description of product |
| `user_id`        | INTEGER (FK) | Unique userID  from users table |

---


## Setup Instructions

### Prerequisites
- Python 3.x
- SQLite (default for Flask)

### Installation

1. **Navigate to the backend folder**
   ```sh
   cd backend
   ```

2. **Create a virtual environment**
   ```sh
   python -m venv venv
   source venv/bin/activate  # On macOS/Linux
   venv\Scripts\activate     # On Windows
   ```

3. **Install dependencies**
   ```sh
   pip install -r requirements.txt
   ```

4. **Run the server**
   ```sh
   python app.py
   ```
   The API will be available at `http://localhost:5000`.

### API Endpoints
| Method | Endpoint         | Description                | Authentication |
| ------ | --------------- | -------------------------- | -------------- |
| POST   | `/auth/login`    | Authenticate user          | ❌ No          |
| POST   | `/auth/signup`   | Register a new user        | ❌ No          |
| GET    | `/products`      | Fetch all products         | ❌ No          |
| POST   | `/products`      | Add a new product          | ✅ Bearer Token |
| PUT    | `/products/<id>` | Update an existing product | ✅ Bearer Token |
| DELETE | `/products/<id>` | Delete a product           | ✅ Bearer Token |

