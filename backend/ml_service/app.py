from flask import Flask, request, jsonify
from flask_cors import CORS
from fake_review_detector import FakeReviewDetector
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize the detector
detector = FakeReviewDetector()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'fake-review-detector',
        'models_loaded': len(detector.models) > 0
    })

@app.route('/predict/review', methods=['POST'])
def predict_review():
    """Predict if a review is fake and analyze patterns"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Process the review
        result = detector.process_review(data)
        
        return jsonify({
            'success': True,
            'predictions': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """Process multiple reviews in batch"""
    try:
        data = request.get_json()
        
        if not data or 'reviews' not in data:
            return jsonify({'error': 'No reviews data provided'}), 400
        
        reviews = data['reviews']
        results = []
        
        for review in reviews:
            result = detector.process_review(review)
            results.append({
                'reviewId': review.get('reviewId'),
                'predictions': result
            })
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/models/status', methods=['GET'])
def models_status():
    """Get status of loaded models"""
    try:
        model_status = {}
        for model_name, model in detector.models.items():
            model_status[model_name] = {
                'loaded': model is not None,
                'type': type(model).__name__ if model else None
            }
        
        return jsonify({
            'success': True,
            'models': model_status,
            'tokenizer_loaded': detector.tokenizer is not None,
            'scaler_loaded': detector.scaler is not None,
            'max_length': detector.max_length
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict/seller-risk', methods=['POST'])
def predict_seller_risk():
    """Calculate seller risk score based on all their reviews"""
    try:
        data = request.get_json()
        seller_reviews = data.get('reviews', [])
        seller_id = data.get('sellerId', 'unknown')
        
        if not seller_reviews:
            return jsonify({
                'success': True,
                'sellerId': seller_id,
                'risk_assessment': {
                    'risk_score': 0,
                    'risk_level': 'low',
                    'total_reviews': 0,
                    'fake_reviews': 0,
                    'fake_review_percentage': 0,
                    'suspicious_patterns': {},
                    'risk_factors': [],
                    'last_updated': datetime.now().isoformat()
                }
            })
        
        # Calculate seller risk score
        risk_assessment = detector.calculate_seller_risk_score(seller_reviews)
        
        return jsonify({
            'success': True,
            'sellerId': seller_id,
            'risk_assessment': risk_assessment
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True) 