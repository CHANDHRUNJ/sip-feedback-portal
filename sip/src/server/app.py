from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- MongoDB Connection ---
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client['sip_feedbacks']
collection = db['feedbacks']

# --- Helper Function ---
def serialize_doc(doc):
    """Converts a MongoDB doc to a JSON-friendly format."""
    if doc and '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

# --- GET Route (with Filtering Support) ---
@app.route('/api/feedback', methods=['GET'])
def get_feedback():
    """Returns feedback with optional filtering by name, dept, and academicYear."""
    try:
        name = request.args.get('name')
        dept = request.args.get('dept')
        academic_year = request.args.get('academicYear')

        query = {}
        if name:
            query['name'] = name
        if dept:
            query['dept'] = dept
        if academic_year:
            query['academicYear'] = academic_year

        results = list(collection.find(query))
        serialized = [serialize_doc(doc) for doc in results]
        return jsonify(serialized)
    except Exception as e:
        return jsonify({"error": "Could not retrieve feedback", "details": str(e)}), 500

# --- POST Route (Submit Feedback) ---
@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """Saves new feedback to MongoDB."""
    try:
        new_feedback = request.get_json()
        if not new_feedback:
            return jsonify({"error": "Invalid data"}), 400

        required_fields = ["name", "dept", "day", "session", "answers"]
        for field in required_fields:
            if field not in new_feedback:
                return jsonify({"error": f"Missing field: {field}"}), 400

        new_feedback["submitted_at"] = datetime.utcnow()
        result = collection.insert_one(new_feedback)
        return jsonify({
            "status": "success",
            "message": "Feedback saved.",
            "inserted_id": str(result.inserted_id)
        })
    except Exception as e:
        return jsonify({"error": "Could not save feedback", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
