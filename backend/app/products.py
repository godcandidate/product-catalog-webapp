from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Product

product_bp = Blueprint('product', __name__)

# Get all products
@product_bp.route("/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([
        {"id": p.id, "name": p.name, "category": p.category, "price": p.price, "description": p.description, "image_url": p.image_url}
        for p in products
    ])

# Get user's products
@product_bp.route("/user/products", methods=["GET"])
@jwt_required()
def get_user_products():
    user_id = int(get_jwt_identity())  # Convert string back to integer
    products = Product.query.filter_by(user_id=user_id).all()
    return jsonify([
        {"id": p.id, "name": p.name, "category": p.category, "price": p.price, "description": p.description, "image_url": p.image_url}
        for p in products
    ])

# Add a product
@product_bp.route("/products", methods=["POST"])
@jwt_required()
def add_product():
    try:
        user_id = int(get_jwt_identity())  # Convert string back to integer
        data = request.json
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        required_fields = ["name", "category", "price", "description", "image_url"]
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        product = Product(
            name=data["name"],
            category=data["category"],
            price=data["price"],
            description=data["description"],
            image_url=data["image_url"],
            user_id=user_id
        )
        db.session.add(product)
        db.session.commit()

        return jsonify({"message": "Product added successfully"}), 201
    except Exception as e:
        print(f"Error adding product: {str(e)}")  # For debugging
        return jsonify({"error": "Failed to add product"}), 500

# Update product
@product_bp.route("/products/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_product(product_id):
    user_id = int(get_jwt_identity())  # Convert string back to integer
    product = Product.query.get(product_id)

    if not product or product.user_id != user_id:
        return jsonify({"message": "Product not found"}), 404

    data = request.json
    product.name = data.get("name", product.name)
    product.category = data.get("category", product.category)
    product.price = data.get("price", product.price)
    product.description = data.get("description", product.description)
    product.image_url = data.get("image_url", product.image_url)

    db.session.commit()
    return jsonify({"message": "Product updated successfully"}), 200

# Delete product
@product_bp.route("/products/<int:product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    user_id = int(get_jwt_identity())  # Convert string back to integer
    product = Product.query.get(product_id)

    if not product or product.user_id != user_id:
        return jsonify({"message": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted successfully"}), 200
