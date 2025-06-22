# Amazon HackON - Fake Review Detection System

A comprehensive AI-powered platform for detecting fake reviews and managing seller risk in e-commerce marketplaces. Built with React, Node.js, Python ML services, and MongoDB.

## 🚀 Features

### 🔍 **Fake Review Detection**
- **ML-Powered Analysis**: Uses TensorFlow models to detect bot-generated and copy-paste reviews
- **Real-time Processing**: Instant analysis of review submissions
- **Confidence Scoring**: Provides confidence levels for each detection
- **Multiple Detection Methods**: Combines ML predictions with rule-based analysis

### 📊 **Analytics Dashboard**
- **Review Analytics**: Real-time insights into review patterns and fraud detection
- **Seller Risk Assessment**: Comprehensive risk scoring based on multiple factors
- **Delivery Violation Tracking**: Monitor and manage delivery-related issues
- **Interactive Charts**: Visual representation of data with auto-refresh functionality

### 👥 **Multi-Role System**
- **Admin Dashboard**: Complete oversight and management capabilities
- **Seller Dashboard**: Individual seller analytics and data upload
- **Role-based Access**: Secure authentication and authorization

### 📈 **Data Management**
- **Batch Processing**: Upload and process multiple reviews/sellers at once
- **CSV Support**: Import data from CSV files
- **Real-time Updates**: Live data synchronization across the platform
- **Export Capabilities**: Download processed data and reports

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   ML Service    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Python)      │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • REST API      │    │ • TensorFlow    │
│ • Analytics     │    │ • Authentication│    │ • ML Models     │
│ • File Upload   │    │ • Database      │    │ • Preprocessing │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   MongoDB       │
                       │                 │
                       │ • Users         │
                       │ • Sellers       │
                       │ • Reviews       │
                       │ • Violations    │
                       └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Shadcn/ui** for UI components
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **CORS** for cross-origin requests

### ML Service
- **Python 3.8+** with Flask
- **TensorFlow** for ML models
- **NumPy** and **Pandas** for data processing
- **Scikit-learn** for preprocessing

### Database
- **MongoDB** for data persistence
- **Mongoose** for schema management

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- MongoDB
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/vayujD/Amazon-HackONv1.git
cd Amazon-HackONv1
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hackon_db
JWT_SECRET=your_jwt_secret_here
ML_SERVICE_URL=http://localhost:5001
```

### 3. ML Service Setup
```bash
cd backend/ml_service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

## 🚀 Running the Application

### 1. Start MongoDB
```bash
mongod
```

### 2. Start the ML Service
```bash
cd backend/ml_service
source venv/bin/activate
python app.py
```
The ML service will run on `http://localhost:5001`

### 3. Start the Backend
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:3000`

### 4. Start the Frontend
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:8081`

## 📋 Usage

### Admin Dashboard
1. **Login** with admin credentials
2. **Review Analytics**: View real-time review analysis and fraud detection
3. **Seller Management**: Manage seller accounts and view risk assessments
4. **Data Upload**: Upload CSV files for batch processing
5. **System Monitoring**: Monitor ML model performance and system health

### Seller Dashboard
1. **Login** with seller credentials
2. **Upload Data**: Submit seller information and reviews
3. **View Analytics**: Access personalized analytics and risk scores
4. **Track Performance**: Monitor review patterns and customer feedback

### Review Submission
1. **Single Review**: Submit individual reviews for analysis
2. **Batch Upload**: Upload multiple reviews via CSV
3. **Real-time Results**: Get instant fraud detection results
4. **Confidence Scores**: View ML model confidence levels

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Reviews
- `POST /api/reviews/submit` - Submit single review
- `POST /api/reviews/batch` - Submit batch reviews
- `GET /api/reviews/analytics` - Get review analytics
- `GET /api/reviews/:id` - Get specific review

### Sellers
- `POST /api/sellers/upload` - Upload seller data
- `GET /api/sellers` - Get all sellers
- `GET /api/sellers/:id` - Get specific seller
- `PUT /api/sellers/:id` - Update seller

### ML Service
- `POST /ml/detect-fake-review` - Detect fake reviews
- `POST /ml/assess-seller-risk` - Assess seller risk
- `GET /ml/models/status` - Check model status

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hackon_db
JWT_SECRET=your_secret_key
ML_SERVICE_URL=http://localhost:5001
NODE_ENV=development
```

#### ML Service (.env)
```env
FLASK_PORT=5001
MODEL_PATH=./ml_models/
DEBUG=True
```

### Database Schema

#### User Model
```javascript
{
  email: String,
  password: String,
  role: String, // 'admin' | 'seller'
  createdAt: Date
}
```

#### Seller Model
```javascript
{
  sellerId: String,
  name: String,
  businessType: String,
  riskScore: Number,
  reviews: Array,
  violations: Array
}
```

#### Review Model
```javascript
{
  reviewId: String,
  sellerId: String,
  content: String,
  rating: Number,
  isFake: Boolean,
  confidence: Number,
  analysis: Object
}
```

## 🤖 ML Models

The system uses pre-trained TensorFlow models for:
- **Bot Detection**: Identifies automated/bot-generated reviews
- **Copy-paste Detection**: Detects duplicate or copied review content
- **Sentiment Analysis**: Analyzes review sentiment and authenticity

### Model Features
- Review text length and complexity
- Sentiment polarity
- Language patterns
- Duplicate detection
- Temporal patterns

## 📈 Analytics Features

### Real-time Dashboard
- **Auto-refresh**: Updates every 60 seconds
- **Countdown Timer**: Shows time until next refresh
- **Live Data**: Real-time connection to MongoDB
- **Interactive Charts**: Zoom, filter, and explore data

### Key Metrics
- Total reviews analyzed
- Fake review percentage
- Average confidence scores
- Seller risk distribution
- Review sentiment trends

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permissions for admin and sellers
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Cross-origin request security
- **Environment Variables**: Secure configuration management

## 🐛 Troubleshooting

### Common Issues

#### Port Conflicts
If you get `EADDRINUSE` errors:
```bash
# Kill processes on specific ports
lsof -ti:3000 | xargs kill -9  # Backend
lsof -ti:5001 | xargs kill -9  # ML Service
lsof -ti:8081 | xargs kill -9  # Frontend
```

#### ML Service Issues
```bash
# Check if models are loaded
curl http://localhost:5001/ml/models/status

# Restart ML service
cd backend/ml_service
source venv/bin/activate
python app.py
```

#### Database Connection
```bash
# Check MongoDB status
mongosh
# or
mongo

# Check connection string in .env file
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Vayuj Dhir** - Full Stack Developer & ML Engineer
- **Amazon HackON Team** - Project Contributors

## 🙏 Acknowledgments

- TensorFlow team for ML framework
- MongoDB for database solution
- React and Node.js communities
- Shadcn/ui for beautiful components

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

---

**Built with ❤️ for Amazon HackON 2024**
