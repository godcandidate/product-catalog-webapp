from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already exists"}), 400

    user = User(name=data["name"], email=data["email"])
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if user and user.check_password(data["password"]):
        print(f"User ID: {user.id}, Type: {type(user.id)}")
        # Convert user.id to string to fix the JWT subject issue
        token = create_access_token(identity=str(user.id),additional_claims={"name": user.name} )
        return jsonify({"token": token})

    return jsonify({"message": "Invalid credentials"}), 401
