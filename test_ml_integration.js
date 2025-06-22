// Test script to verify ML integration
const fetch = require('node-fetch');

async function testMLIntegration() {
  console.log('🧪 Testing ML Integration...\n');

  // Test 1: Python ML Service Health
  console.log('1. Testing Python ML Service Health...');
  try {
    const healthResponse = await fetch('http://localhost:5001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Python ML Service:', healthData);
  } catch (error) {
    console.log('❌ Python ML Service Error:', error.message);
  }

  // Test 2: Python ML Service Review Prediction
  console.log('\n2. Testing Review Prediction...');
  try {
    const reviewData = {
      reviewText: "This product is amazing! I love it so much.",
      rating: 5,
      reviewerId: "user123",
      productId: "prod456",
      reviewDate: "2024-01-15T10:30:00Z",
      ipAddress: "192.168.1.1",
      verifiedPurchase: true
    };

    const predictionResponse = await fetch('http://localhost:5001/predict/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    const predictionData = await predictionResponse.json();
    console.log('✅ Review Prediction:', JSON.stringify(predictionData, null, 2));
  } catch (error) {
    console.log('❌ Review Prediction Error:', error.message);
  }

  // Test 3: Test suspicious review
  console.log('\n3. Testing Suspicious Review...');
  try {
    const suspiciousReviewData = {
      reviewText: "This is the best product ever! Amazing quality! Perfect!",
      rating: 5,
      reviewerId: "user456",
      productId: "prod789",
      reviewDate: "2024-01-15T10:30:00Z",
      ipAddress: "192.168.1.1",
      verifiedPurchase: false
    };

    const suspiciousResponse = await fetch('http://localhost:5001/predict/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(suspiciousReviewData)
    });
    const suspiciousData = await suspiciousResponse.json();
    console.log('✅ Suspicious Review Prediction:', JSON.stringify(suspiciousData, null, 2));
  } catch (error) {
    console.log('❌ Suspicious Review Error:', error.message);
  }

  // Test 4: Batch Processing
  console.log('\n4. Testing Batch Processing...');
  try {
    const batchData = {
      reviews: [
        {
          reviewText: "Great product, highly recommend!",
          rating: 4,
          reviewerId: "user1",
          productId: "prod1"
        },
        {
          reviewText: "Terrible quality, waste of money",
          rating: 1,
          reviewerId: "user2",
          productId: "prod2"
        }
      ]
    };

    const batchResponse = await fetch('http://localhost:5001/predict/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData)
    });
    const batchResult = await batchResponse.json();
    console.log('✅ Batch Processing:', JSON.stringify(batchResult, null, 2));
  } catch (error) {
    console.log('❌ Batch Processing Error:', error.message);
  }

  console.log('\n🎉 ML Integration Test Complete!');
  console.log('\n📱 You can now access:');
  console.log('   Frontend: http://localhost:8080');
  console.log('   Backend API: http://localhost:3000');
  console.log('   ML Service: http://localhost:5001');
}

testMLIntegration().catch(console.error); 