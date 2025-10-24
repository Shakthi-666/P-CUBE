import json
import time
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- CONFIGURATION AND SETUP ---
app = Flask(__name__)
# Allows your frontend (HTML/JS) to send requests to this server
CORS(app) 

# --- MOCK DATABASE (Simulated Data Storage) ---
# This data will be reset every time the server is stopped and restarted.
USERS = {}
STREAKS = {}
SHARED_ITEMS = [
    # Initial data loaded when the server starts (Matches your JS initialization)
    {"id": 1, "type": "Food", "itemName": "Surplus Dosa Batter", "listingType": "Quarter Price", "discountType": "Quarter Price", "user": "FoodieGuru", "contact": "+91 999 12345", "price": "₹40"},
    {"id": 2, "type": "Product", "itemName": "Old Study Lamp", "listingType": "For Free", "discountType": "", "user": "EcoSamaritan", "contact": "+91 888 67890", "price": "FREE"},
]
ITEM_ID_COUNTER = 3


# --- HELPER FUNCTIONS ---

def mock_ai_validation(action_type):
    """Simulates AI processing delay and returns a guaranteed successful validation."""
    time.sleep(1)  # Shorter delay for smoother testing

    if action_type == 'Planted':
        return {
            "success": True,
            "message": "Validation Success!",
            "ecoMetrics": {
                "oxygenGained": "0.01%",
                "co2Reduced": "0.05%",
                "landslideReduced": "0.2%"
            }
        }
    elif action_type == 'WaterWarrior':
        return {
            "success": True,
            "message": "Confirmed: Water saving action/sequence identified.",
        }
    
    return {"success": False, "message": "AI validation failed. (Mock Error)"}


# --- API ENDPOINTS ---

@app.route('/register', methods=['POST'])
def register_user():
    """Handles new user registration."""
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if email in USERS:
        return jsonify({"success": False, "message": "Email already registered."}), 409

    if not all([data.get('username'), email, password, data.get('contact')]):
        return jsonify({"success": False, "message": "Missing required fields."}), 400

    USERS[email] = {
        'username': data.get('username'),
        'password': password, # WARNING: Store hashed passwords in production!
        'email': email,
        'contact': data.get('contact'),
        'age': data.get('age'),
        'country': data.get('country'),
        'location': data.get('location'),
        'address': data.get('address'),
        'emergency': data.get('emergency')
    }
    STREAKS[email] = 0
    
    # Return user data required by the frontend's saveUserState function
    user_data = {k: v for k, v in USERS[email].items() if k not in ['password']}
    user_data['streaks'] = 0

    print(f"New user registered: {user_data['username']}")
    return jsonify({"success": True, "message": "Registration successful!", "user": user_data}), 201


@app.route('/login', methods=['POST'])
def login_user():
    """Handles user login."""
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = USERS.get(email)

    # Check credentials
    if not user or user['password'] != password:
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    # Return user data required by the frontend
    user_data = {k: v for k, v in user.items() if k not in ['password']}
    user_data['streaks'] = STREAKS.get(email, 0)
    
    print(f"User logged in: {user_data['username']}")
    return jsonify({"success": True, "message": "Login successful!", "user": user_data}), 200


@app.route('/validate_action', methods=['POST'])
def validate_action():
    """Handles validation for planted/water warrior actions."""
    if 'image' not in request.files:
        return jsonify({"success": False, "message": "No image file provided."}), 400
    
    action_type = request.form.get('action_type')
    user_email = request.form.get('email')
    
    if not all([action_type, user_email]):
        return jsonify({"success": False, "message": "Missing required action data."}), 400

    # Simulate AI Validation
    ai_response = mock_ai_validation(action_type=action_type)

    if not ai_response['success']:
        return jsonify(ai_response), 400

    # Award Streaks
    streaks_to_add = 2 if action_type == 'Planted' else 1
    STREAKS[user_email] = STREAKS.get(user_email, 0) + streaks_to_add

    response = {
        "success": True,
        "message": ai_response.get("message", "Action validated and streaks awarded."),
        "streaks_awarded": streaks_to_add,
        "new_total_streaks": STREAKS[user_email]
    }
    if action_type == 'Planted':
        response['eco_metrics'] = ai_response['ecoMetrics']
    
    print(f"Streaks awarded to {user_email}. New total: {STREAKS[user_email]}")
    return jsonify(response), 200


@app.route('/post_item', methods=['POST'])
def post_community_item():
    """Handles posting a new item to the community feed."""
    global ITEM_ID_COUNTER
    data = request.json
    
    required_fields = ['user', 'contact', 'type', 'itemName', 'listingType']
    if not all(field in data for field in required_fields):
        return jsonify({"success": False, "message": "Missing required item details."}), 400
    
    new_item = {
        "id": ITEM_ID_COUNTER,
        "user": data['user'],
        "contact": data['contact'],
        "type": data['type'],
        "itemName": data['itemName'],
        "listingType": data['listingType'],
        "discountType": data.get('discountType', ''),
        "price": data.get('price', 'FREE'),
    }
    SHARED_ITEMS.insert(0, new_item)
    ITEM_ID_COUNTER += 1
    
    # Award streaks logic matching JS
    listing = data['listingType']
    if listing in ['For Free', 'Quarter Price', 'Half Price']:
        streaks_to_add = 5
        user_email = data.get('email', 'default@user.com')
        STREAKS[user_email] = STREAKS.get(user_email, 0) + streaks_to_add
    else:
        streaks_to_add = 0
    
    print(f"Item posted by {data['user']}. Streaks: +{streaks_to_add}")
    return jsonify({"success": True, "message": "Item successfully shared!", "streaks_awarded": streaks_to_add, "itemId": new_item['id']}), 201


@app.route('/feed', methods=['GET'])
def get_community_feed():
    """Returns the current list of shared items."""
    # The frontend is now responsible for handling the feed based on localStorage (in JS)
    # This mock endpoint returns the data for the frontend to merge/display.
    return jsonify({"success": True, "items": SHARED_ITEMS}), 200


@app.route('/send_report', methods=['POST'])
def send_report():
    """Simulates sending an environmental report email."""
    data = request.json
    time.sleep(1)
    print(f"REPORT RECEIVED: To {data.get('recipient_email')}")
    return jsonify({"success": True, "message": "Geo-tagged report successfully processed and sent."}), 200


# --- RUN SERVER ---
if __name__ == '__main__':
    # Add initial mock user for easy testing
    USERS['test@eco.com'] = {
        'username': 'EcoTestUser',
        'password': '123', # Matches password in JS mock login
        'email': 'test@eco.com',
        'contact': '+91 9876543210',
        'location': 'Coimbatore',
        'age': '30', 'country': 'India', 'address': '123 Test St', 'emergency': '911'
    }
    STREAKS['test@eco.com'] = 50
    
    print("Flask Server running...")
    # Run on port 5000 as referenced in your JavaScript
    app.run(debug=True, port=5000)