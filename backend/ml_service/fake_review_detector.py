import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
from datetime import datetime
import json
import os
import pickle

class FakeReviewDetector:
    def __init__(self, models_dir='./ml_models'):
        self.models_dir = models_dir
        self.tokenizer = None
        self.scaler = None
        self.max_length = 0
        self.models = {}
        
        # Load models and preprocessing components
        self.load_models()
    
    def load_models(self):
        """Load all trained models and preprocessing components"""
        try:
            # Load tokenizer
            with open(os.path.join(self.models_dir, 'tokenizer.pkl'), 'rb') as f:
                self.tokenizer = pickle.load(f)
            
            # Load scaler
            with open(os.path.join(self.models_dir, 'scaler.pkl'), 'rb') as f:
                self.scaler = pickle.load(f)
            
            # Load max_length
            with open(os.path.join(self.models_dir, 'max_length.txt'), 'r') as f:
                self.max_length = int(f.read().strip())
            
            # Load models
            self.models['fake_review'] = load_model(os.path.join(self.models_dir, 'fake_review.h5'))
            self.models['burst_review'] = load_model(os.path.join(self.models_dir, 'burst_review.h5'))
            self.models['copy_paste_review'] = load_model(os.path.join(self.models_dir, 'copy-paste_review.h5'))
            self.models['likely_bot'] = load_model(os.path.join(self.models_dir, 'likely_bot.h5'))
            
            print("All models loaded successfully!")
            
        except Exception as e:
            print(f"Error loading models: {e}")
            # Initialize with default values if models not found
            self.tokenizer = Tokenizer()
            self.scaler = MinMaxScaler()
            self.max_length = 100
    
    def preprocess_review(self, review_data):
        """Preprocess review data for model prediction"""
        try:
            # Extract features
            review_text = review_data.get('reviewText', '')
            rating = review_data.get('rating', 5)
            review_date = review_data.get('reviewDate', datetime.now().isoformat())
            ip_address = review_data.get('ipAddress', 'unknown')
            
            # Calculate time difference (placeholder - would need previous review time)
            time_diff = 0  # This would be calculated from previous review
            
            # Calculate IP frequency (placeholder - would need IP history)
            ip_count = 1  # This would be calculated from IP history
            
            # Enhanced text analysis for bot/copy-paste detection
            text_features = self.analyze_text_patterns(review_text)
            
            # Prepare text features
            if not self.tokenizer.word_index:
                # If tokenizer is empty, fit it on the current text
                self.tokenizer.fit_on_texts([review_text])
            
            text_sequence = self.tokenizer.texts_to_sequences([review_text])
            text_padded = pad_sequences(text_sequence, maxlen=self.max_length)
            
            # Prepare extra features with enhanced analysis
            extra_features = np.array([[
                time_diff, 
                ip_count,
                text_features['repetition_score'],
                text_features['suspicious_phrase_count'],
                text_features['exclamation_count'],
                text_features['generic_word_count']
            ]])
            
            # Handle scaler feature mismatch
            if hasattr(self.scaler, 'scale_'):
                try:
                    # Try to use the original scaler with just the first 2 features
                    original_features = extra_features[:, :2]
                    scaled_original = self.scaler.transform(original_features)
                    
                    # Create a new array with scaled original features and new features
                    scaled_features = np.column_stack([
                        scaled_original,
                        extra_features[:, 2:]  # Add new features without scaling
                    ])
                except Exception as e:
                    print(f"Scaler error, using original features: {e}")
                    # Fallback to original 2 features
                    scaled_features = np.array([[time_diff, ip_count]])
            else:
                # No scaler available, use original features
                scaled_features = np.array([[time_diff, ip_count]])
            
            return {
                'text_features': text_padded,
                'extra_features': scaled_features,
                'review_text': review_text,
                'rating': rating,
                'text_analysis': text_features
            }
            
        except Exception as e:
            print(f"Error preprocessing review: {e}")
            return None
    
    def analyze_text_patterns(self, review_text):
        """Analyze text for suspicious patterns that indicate bot or copy-paste activity"""
        try:
            text_lower = review_text.lower()
            words = text_lower.split()
            
            # Check for repetition patterns
            word_counts = {}
            for word in words:
                word_counts[word] = word_counts.get(word, 0) + 1
            
            # Calculate repetition score
            total_words = len(words)
            unique_words = len(word_counts)
            repetition_score = 1 - (unique_words / total_words) if total_words > 0 else 0
            
            # Check for suspicious phrases commonly used by bots
            suspicious_phrases = [
                'great product', 'fast shipping', 'excellent quality', 'highly recommend',
                'would buy again', 'perfect transaction', 'amazing service', 'best purchase',
                'love it', 'excellent product', 'great service', 'fast delivery',
                'good quality', 'satisfied with', 'recommend to friends', 'thank you seller'
            ]
            
            suspicious_phrase_count = sum(1 for phrase in suspicious_phrases if phrase in text_lower)
            
            # Count exclamation marks (bots often overuse them)
            exclamation_count = text_lower.count('!')
            
            # Count generic words that bots often use
            generic_words = ['good', 'great', 'excellent', 'amazing', 'perfect', 'best', 'love', 'recommend']
            generic_word_count = sum(1 for word in generic_words if word in text_lower)
            
            # Check for repetitive sentence structures
            sentences = review_text.split('.')
            sentence_start_words = []
            for sentence in sentences:
                if sentence.strip():
                    first_word = sentence.strip().split()[0].lower() if sentence.strip().split() else ''
                    sentence_start_words.append(first_word)
            
            # Count repeated sentence starters
            repeated_starters = len(sentence_start_words) - len(set(sentence_start_words))
            
            return {
                'repetition_score': repetition_score,
                'suspicious_phrase_count': suspicious_phrase_count,
                'exclamation_count': exclamation_count,
                'generic_word_count': generic_word_count,
                'repeated_starters': repeated_starters,
                'total_words': total_words,
                'unique_words': unique_words
            }
            
        except Exception as e:
            print(f"Error analyzing text patterns: {e}")
            return {
                'repetition_score': 0,
                'suspicious_phrase_count': 0,
                'exclamation_count': 0,
                'generic_word_count': 0,
                'repeated_starters': 0,
                'total_words': 0,
                'unique_words': 0
            }
    
    def predict_fake_review(self, review_data):
        """Predict if a review is fake using the main model"""
        try:
            preprocessed = self.preprocess_review(review_data)
            if not preprocessed:
                return self.get_default_prediction()
            
            prediction = self.models['fake_review'].predict([
                preprocessed['text_features'],
                preprocessed['extra_features']
            ])
            
            confidence = float(prediction[0][0])
            # Lower threshold from 0.5 to 0.45 to catch more AI-generated content
            is_fake = confidence > 0.45
            
            return {
                'isFake': bool(is_fake),
                'confidence': confidence,
                'riskScore': confidence * 100
            }
            
        except Exception as e:
            print(f"Error predicting fake review: {e}")
            return self.get_default_prediction()
    
    def predict_suspicious_patterns(self, review_data):
        """Predict various suspicious patterns with confidence scores"""
        try:
            preprocessed = self.preprocess_review(review_data)
            if not preprocessed:
                return {
                    'burst_reviews': {'detected': False, 'confidence': 0.0},
                    'copy_paste': {'detected': False, 'confidence': 0.0},
                    'bot_activity': {'detected': False, 'confidence': 0.0}
                }
            
            patterns = {}
            
            # Get ML model predictions
            burst_pred = self.models['burst_review'].predict([
                preprocessed['text_features'],
                preprocessed['extra_features']
            ])
            burst_confidence = float(burst_pred[0][0])
            
            copy_paste_pred = self.models['copy_paste_review'].predict([
                preprocessed['text_features'],
                preprocessed['extra_features']
            ])
            copy_paste_confidence = float(copy_paste_pred[0][0])
            
            bot_pred = self.models['likely_bot'].predict([
                preprocessed['text_features'],
                preprocessed['extra_features']
            ])
            bot_confidence = float(bot_pred[0][0])
            
            # Apply rule-based enhancements
            text_analysis = preprocessed.get('text_analysis', {})
            
            # Enhanced bot detection
            bot_enhanced_confidence = self.enhance_bot_detection(bot_confidence, text_analysis, review_data)
            
            # Enhanced copy-paste detection
            copy_paste_enhanced_confidence = self.enhance_copy_paste_detection(copy_paste_confidence, text_analysis, review_data)
            
            # Enhanced burst detection
            burst_enhanced_confidence = self.enhance_burst_detection(burst_confidence, review_data)
            
            patterns['burst_reviews'] = {
                'detected': burst_enhanced_confidence > 0.35,
                'confidence': burst_enhanced_confidence
            }
            
            patterns['copy_paste'] = {
                'detected': copy_paste_enhanced_confidence > 0.35,
                'confidence': copy_paste_enhanced_confidence
            }
            
            patterns['bot_activity'] = {
                'detected': bot_enhanced_confidence > 0.35,
                'confidence': bot_enhanced_confidence
            }
            
            return patterns
            
        except Exception as e:
            print(f"Error predicting suspicious patterns: {e}")
            return {
                'burst_reviews': {'detected': False, 'confidence': 0.0},
                'copy_paste': {'detected': False, 'confidence': 0.0},
                'bot_activity': {'detected': False, 'confidence': 0.0}
            }
    
    def enhance_bot_detection(self, ml_confidence, text_analysis, review_data):
        """Enhance bot detection with rule-based analysis"""
        enhanced_confidence = ml_confidence
        
        # Boost confidence for suspicious patterns
        if text_analysis.get('suspicious_phrase_count', 0) >= 3:
            enhanced_confidence += 0.2
        
        if text_analysis.get('exclamation_count', 0) >= 3:
            enhanced_confidence += 0.15
        
        if text_analysis.get('generic_word_count', 0) >= 4:
            enhanced_confidence += 0.1
        
        if text_analysis.get('repetition_score', 0) > 0.3:
            enhanced_confidence += 0.15
        
        # Check for rating-text mismatch (5-star with generic text)
        rating = review_data.get('rating', 5)
        if rating == 5 and text_analysis.get('total_words', 0) < 10:
            enhanced_confidence += 0.1
        
        return min(enhanced_confidence, 1.0)
    
    def enhance_copy_paste_detection(self, ml_confidence, text_analysis, review_data):
        """Enhance copy-paste detection with rule-based analysis"""
        enhanced_confidence = ml_confidence
        
        # Boost confidence for copy-paste indicators
        if text_analysis.get('repetition_score', 0) > 0.4:
            enhanced_confidence += 0.25
        
        if text_analysis.get('suspicious_phrase_count', 0) >= 4:
            enhanced_confidence += 0.2
        
        if text_analysis.get('repeated_starters', 0) >= 2:
            enhanced_confidence += 0.15
        
        # Check for very generic text
        if text_analysis.get('generic_word_count', 0) >= 5:
            enhanced_confidence += 0.1
        
        return min(enhanced_confidence, 1.0)
    
    def enhance_burst_detection(self, ml_confidence, review_data):
        """Enhance burst detection with rule-based analysis"""
        enhanced_confidence = ml_confidence
        
        # This would be enhanced with actual time-series data
        # For now, we'll use the ML model confidence
        return enhanced_confidence
    
    def analyze_sentiment(self, review_text):
        """Simple sentiment analysis based on rating and text"""
        try:
            # This is a simple sentiment analysis
            # In a real implementation, you might use a dedicated sentiment model
            positive_words = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'best', 'wonderful']
            negative_words = ['bad', 'terrible', 'awful', 'hate', 'worst', 'disappointing', 'poor']
            
            text_lower = review_text.lower()
            positive_count = sum(1 for word in positive_words if word in text_lower)
            negative_count = sum(1 for word in negative_words if word in text_lower)
            
            if positive_count > negative_count:
                sentiment = 'positive'
                sentiment_score = min(0.8 + (positive_count * 0.1), 1.0)
            elif negative_count > positive_count:
                sentiment = 'negative'
                sentiment_score = max(-0.8 - (negative_count * 0.1), -1.0)
            else:
                sentiment = 'neutral'
                sentiment_score = 0.0
            
            return {
                'sentiment': sentiment,
                'sentimentScore': sentiment_score
            }
            
        except Exception as e:
            print(f"Error analyzing sentiment: {e}")
            return {
                'sentiment': 'neutral',
                'sentimentScore': 0.0
            }
    
    def calculate_review_authenticity(self, review_data, predictions):
        """Calculate overall review authenticity score"""
        try:
            base_score = 100
            
            # Reduce score based on fake review probability
            if predictions.get('isFake', False):
                base_score -= predictions.get('confidence', 0.5) * 50
            
            # Reduce score based on suspicious patterns
            patterns = predictions.get('suspiciousPatterns', [])
            base_score -= len(patterns) * 15
            
            # Reduce score for very short or very long reviews
            review_length = len(review_data.get('reviewText', '').split())
            if review_length < 5:
                base_score -= 20
            elif review_length > 500:
                base_score -= 10
            
            # Reduce score for extreme ratings (1 or 5) with short text
            rating = review_data.get('rating', 5)
            if (rating == 1 or rating == 5) and review_length < 10:
                base_score -= 15
            
            return max(0, min(100, base_score))
            
        except Exception as e:
            print(f"Error calculating authenticity: {e}")
            return 50
    
    def calculate_reviewer_credibility(self, reviewer_data):
        """Calculate reviewer credibility score"""
        try:
            base_score = 50
            
            # Increase score for verified purchases
            verified_purchases = reviewer_data.get('verifiedPurchases', 0)
            base_score += min(verified_purchases * 5, 30)
            
            # Increase score for longer account history
            account_age_days = reviewer_data.get('accountAgeDays', 0)
            base_score += min(account_age_days / 30, 20)
            
            # Decrease score for suspicious activity
            fake_reviews = reviewer_data.get('fakeReviewsDetected', 0)
            base_score -= fake_reviews * 20
            
            return max(0, min(100, base_score))
            
        except Exception as e:
            print(f"Error calculating credibility: {e}")
            return 50
    
    def get_default_prediction(self):
        """Return default prediction when models fail"""
        return {
            'isFake': False,
            'confidence': 0.5,
            'riskScore': 50,
            'suspiciousPatterns': {
                'burst_reviews': {'detected': False, 'confidence': 0.0},
                'copy_paste': {'detected': False, 'confidence': 0.0},
                'bot_activity': {'detected': False, 'confidence': 0.0}
            },
            'reviewAuthenticity': 50,
            'reviewerCredibility': 50,
            'burstReviewDetected': False,
            'burstReviewConfidence': 0.0,
            'copyPasteDetected': False,
            'copyPasteConfidence': 0.0,
            'botActivityDetected': False,
            'botActivityConfidence': 0.0
        }
    
    def process_review(self, review_data):
        """Main method to process a review and return all predictions"""
        try:
            # Get fake review prediction
            fake_prediction = self.predict_fake_review(review_data)
            
            # Get suspicious patterns with detailed confidence scores
            suspicious_patterns = self.predict_suspicious_patterns(review_data)
            
            # Analyze sentiment
            sentiment_analysis = self.analyze_sentiment(review_data.get('reviewText', ''))
            
            # Calculate authenticity
            review_authenticity = self.calculate_review_authenticity(review_data, {
                'isFake': fake_prediction['isFake'],
                'confidence': fake_prediction['confidence'],
                'suspiciousPatterns': suspicious_patterns
            })
            
            # Calculate reviewer credibility (placeholder data)
            reviewer_credibility = self.calculate_reviewer_credibility({
                'verifiedPurchases': review_data.get('verifiedPurchase', False),
                'accountAgeDays': review_data.get('accountAgeDays', 30),
                'fakeReviewsDetected': 0
            })
            
            return {
                'isFake': fake_prediction['isFake'],
                'confidence': fake_prediction['confidence'],
                'riskScore': fake_prediction['riskScore'],
                'sentiment': sentiment_analysis['sentiment'],
                'sentimentScore': sentiment_analysis['sentimentScore'],
                'suspiciousPatterns': suspicious_patterns,
                'reviewAuthenticity': review_authenticity,
                'reviewerCredibility': reviewer_credibility,
                # Detailed model outputs
                'burstReviewDetected': suspicious_patterns['burst_reviews']['detected'],
                'burstReviewConfidence': suspicious_patterns['burst_reviews']['confidence'],
                'copyPasteDetected': suspicious_patterns['copy_paste']['detected'],
                'copyPasteConfidence': suspicious_patterns['copy_paste']['confidence'],
                'botActivityDetected': suspicious_patterns['bot_activity']['detected'],
                'botActivityConfidence': suspicious_patterns['bot_activity']['confidence']
            }
            
        except Exception as e:
            print(f"Error processing review: {e}")
            return self.get_default_prediction()
    
    def calculate_seller_risk_score(self, seller_reviews):
        """
        Calculate seller risk score based on all their reviews
        
        Args:
            seller_reviews: List of review dictionaries for a seller
            
        Returns:
            dict: Seller risk assessment with score and breakdown
        """
        if not seller_reviews:
            return {
                'risk_score': 0,
                'risk_level': 'low',
                'total_reviews': 0,
                'fake_review_percentage': 0,
                'suspicious_patterns': [],
                'risk_factors': []
            }
        
        total_reviews = len(seller_reviews)
        fake_reviews = 0
        suspicious_patterns = {
            'burst_reviews': 0,
            'copy_paste': 0,
            'bot_activity': 0,
            'inconsistent_ratings': 0,
            'short_reviews': 0
        }
        risk_factors = []
        
        # Analyze each review
        for review in seller_reviews:
            try:
                # Get ML predictions for this review
                predictions = self.predict_fake_review(review)
                
                if predictions['isFake']:
                    fake_reviews += 1
                
                # Check suspicious patterns
                if predictions.get('suspiciousPatterns'):
                    patterns = predictions['suspiciousPatterns']
                    if patterns.get('burst_reviews', {}).get('detected', False):
                        suspicious_patterns['burst_reviews'] += 1
                    if patterns.get('copy_paste', {}).get('detected', False):
                        suspicious_patterns['copy_paste'] += 1
                    if patterns.get('bot_activity', {}).get('detected', False):
                        suspicious_patterns['bot_activity'] += 1
                
                # Check for short reviews (potential spam)
                review_text = review.get('reviewText', '')
                if len(review_text.split()) < 5:
                    suspicious_patterns['short_reviews'] += 1
                    
            except Exception as e:
                print(f"Error analyzing review: {e}")
                continue
        
        # Calculate risk factors
        fake_review_percentage = (fake_reviews / total_reviews) * 100 if total_reviews > 0 else 0
        
        if fake_review_percentage > 50:
            risk_factors.append(f"High fake review rate: {fake_review_percentage:.1f}%")
        
        if suspicious_patterns['burst_reviews'] > 0:
            risk_factors.append(f"Burst review patterns detected: {suspicious_patterns['burst_reviews']}")
            
        if suspicious_patterns['copy_paste'] > 0:
            risk_factors.append(f"Copy-paste reviews detected: {suspicious_patterns['copy_paste']}")
            
        if suspicious_patterns['bot_activity'] > 0:
            risk_factors.append(f"Bot activity detected: {suspicious_patterns['bot_activity']}")
            
        if suspicious_patterns['short_reviews'] > total_reviews * 0.3:
            risk_factors.append(f"High percentage of short reviews: {suspicious_patterns['short_reviews']}")
        
        # Calculate overall risk score (0-100)
        risk_score = 0
        
        # Fake review percentage weight (40%)
        risk_score += (fake_review_percentage * 0.4)
        
        # Suspicious patterns weight (30%)
        pattern_score = (
            (suspicious_patterns['burst_reviews'] / total_reviews * 100) * 0.1 +
            (suspicious_patterns['copy_paste'] / total_reviews * 100) * 0.1 +
            (suspicious_patterns['bot_activity'] / total_reviews * 100) * 0.1
        )
        risk_score += pattern_score
        
        # Short reviews weight (20%)
        short_review_percentage = (suspicious_patterns['short_reviews'] / total_reviews * 100) if total_reviews > 0 else 0
        risk_score += (short_review_percentage * 0.2)
        
        # Volume factor (10%) - sellers with many reviews get slight penalty
        if total_reviews > 50:
            risk_score += 5
        
        # Cap at 100
        risk_score = min(risk_score, 100)
        
        # Determine risk level
        if risk_score >= 70:
            risk_level = 'high'
        elif risk_score >= 40:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return {
            'risk_score': round(risk_score, 2),
            'risk_level': risk_level,
            'total_reviews': total_reviews,
            'fake_reviews': fake_reviews,
            'fake_review_percentage': round(fake_review_percentage, 2),
            'suspicious_patterns': suspicious_patterns,
            'risk_factors': risk_factors,
            'last_updated': datetime.now().isoformat()
        }

# Global instance
detector = FakeReviewDetector()

def process_review_api(review_data):
    """API function to process review data"""
    return detector.process_review(review_data)

if __name__ == "__main__":
    # Test the detector
    test_review = {
        'reviewText': 'This product is amazing! I love it so much. Best purchase ever!',
        'rating': 5,
        'reviewDate': '2024-01-15T10:30:00Z',
        'ipAddress': '192.168.1.1',
        'verifiedPurchase': True
    }
    
    result = detector.process_review(test_review)
    print("Test Result:", json.dumps(result, indent=2)) 