#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fake_review_detector import FakeReviewDetector
import json

def test_bot_detection():
    """Test bot detection with various scenarios"""
    detector = FakeReviewDetector()
    
    test_cases = [
        {
            'name': 'Obvious Bot Review',
            'review': {
                'reviewText': 'This product is amazing! I love it so much. Best purchase ever! Perfect quality and fast delivery. Highly recommended!',
                'rating': 5,
                'reviewDate': '2024-01-15T10:30:00Z',
                'ipAddress': '192.168.1.1'
            }
        },
        {
            'name': 'Copy-Paste Review',
            'review': {
                'reviewText': 'Great product, fast shipping, excellent quality, highly recommend, would buy again, perfect transaction, amazing service',
                'rating': 5,
                'reviewDate': '2024-01-15T10:30:00Z',
                'ipAddress': '192.168.1.1'
            }
        },
        {
            'name': 'Suspicious Bot Pattern',
            'review': {
                'reviewText': 'Product arrived on time. Good quality. Satisfied with purchase. Will recommend to friends. Thank you seller.',
                'rating': 5,
                'reviewDate': '2024-01-15T10:30:00Z',
                'ipAddress': '192.168.1.1'
            }
        },
        {
            'name': 'Normal Review',
            'review': {
                'reviewText': 'I bought this product last week and it works well. The quality is decent for the price. Shipping took 3 days which is reasonable.',
                'rating': 4,
                'reviewDate': '2024-01-15T10:30:00Z',
                'ipAddress': '192.168.1.1'
            }
        }
    ]
    
    print("=== Testing Bot and Copy-Paste Detection ===\n")
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"Test {i}: {test_case['name']}")
        print(f"Review Text: {test_case['review']['reviewText']}")
        print(f"Rating: {test_case['review']['rating']}")
        
        try:
            result = detector.process_review(test_case['review'])
            
            print(f"Bot Activity Detected: {result['botActivityDetected']}")
            print(f"Bot Confidence: {result['botActivityConfidence']:.3f}")
            print(f"Copy-Paste Detected: {result['copyPasteDetected']}")
            print(f"Copy-Paste Confidence: {result['copyPasteConfidence']:.3f}")
            print(f"Overall Fake: {result['isFake']}")
            print(f"Overall Confidence: {result['confidence']:.3f}")
            print("-" * 50)
            
        except Exception as e:
            print(f"Error: {e}")
            print("-" * 50)

def test_model_loading():
    """Test if models are loading correctly"""
    print("=== Testing Model Loading ===\n")
    
    try:
        detector = FakeReviewDetector()
        print("✅ Models loaded successfully")
        print(f"Available models: {list(detector.models.keys())}")
        
        # Test if models can make predictions
        test_review = {
            'reviewText': 'Test review',
            'rating': 5,
            'reviewDate': '2024-01-15T10:30:00Z',
            'ipAddress': '192.168.1.1'
        }
        
        result = detector.process_review(test_review)
        print("✅ Models can make predictions")
        print(f"Sample prediction: {result['isFake']}")
        
    except Exception as e:
        print(f"❌ Error loading models: {e}")

if __name__ == "__main__":
    test_model_loading()
    print("\n")
    test_bot_detection() 