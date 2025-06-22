# Amazon HackON 

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
- **Auto-refresh**: Live data updates with countdown timer
- **Interactive Charts**: Visual representation of analytics data

### 👥 **Multi-Role System**
- **Admin Dashboard**: Complete system management and oversight
- **Seller Dashboard**: Individual seller analytics and data upload
- **User Management**: Secure authentication and role-based access

### 📈 **Data Management**
- **Batch Processing**: Upload multiple sellers and reviews at once
- **CSV Support**: Easy data import from spreadsheet files
- **Real-time Validation**: Instant feedback on data quality
- **Risk Scoring**: Automated assessment of seller risk levels

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
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **Recharts** for data visualization

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Multer** for file uploads
- **CORS** enabled

### ML Service
- **Python 3.8+** with Flask
- **TensorFlow** for ML models
- **scikit-learn** for preprocessing
- **NLTK** for text analysis

### Database
- **MongoDB** for data persistence
- **Mongoose** for schema management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (3.8 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## 🚀 Getting Started

### Step 1: Clone the Repository

```bash
git clone https://github.com/vayujD/Amazon-HackONv1.git
cd Amazon-HackONv1
```

### Step 2: Set Up the Backend

```bash
# Navigate to backend directory
cd backend

# Install Node.js dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure your `.env` file:**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hackon_db
JWT_SECRET=your_jwt_secret_here
ML_SERVICE_URL=http://localhost:5001
```

### Step 3: Set Up the ML Service

```bash
# Navigate to ML service directory
cd ml_service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Start the ML service
python app.py
```

The ML service will start on port 5001. Keep this terminal window open.

### Step 4: Set Up the Frontend

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on port 8080 (or 8081 if 8080 is busy).

### Step 5: Start the Backend

Open another terminal window:

```bash
# Navigate to backend directory
cd backend

# Start the backend server
npm run dev
```

The backend will start on port 3000.

### Step 6: Access the Application

- **Frontend**: http://localhost:8080 (or 8081)
- **Backend API**: http://localhost:3000
- **ML Service**: http://localhost:5001

## 🔧 Troubleshooting

### Port Conflicts

If you encounter port conflicts:

**For Backend (Port 3000):**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

**For Frontend (Port 8080):**
```bash
# Find and kill process using port 8080
lsof -ti:8080 | xargs kill -9
```

**For ML Service (Port 5001):**
```bash
# Find and kill process using port 5001
lsof -ti:5001 | xargs kill -9
```

### MongoDB Connection Issues

If MongoDB is not running locally:

1. **Install MongoDB locally:**
   ```bash
   # On macOS with Homebrew:
   brew install mongodb-community
   brew services start mongodb-community
   
   # On Ubuntu:
   sudo apt-get install mongodb
   sudo systemctl start mongodb
   ```

2. **Or use MongoDB Atlas:**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Get your connection string
   - Update the `MONGODB_URI` in your `.env` file

### Python Virtual Environment Issues

If you have issues with the Python virtual environment:

```bash
# Remove and recreate the virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Node.js Dependencies Issues

If you have issues with Node.js dependencies:

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Missing Scripts Error

If you get "Missing script: dev" error, make sure you're in the correct directory:

```bash
# For frontend
cd frontend
npm run dev

# For backend
cd backend
npm run dev
```

### ML Service Not Starting

If the ML service fails to start:

```bash
# Check if Python and pip are installed
python --version
pip --version

# Make sure you're in the virtual environment
source venv/bin/activate

# Check if all dependencies are installed
pip list

# Try running with debug mode
python app.py --debug
```

## 📁 Project Structure

```
Amazon-HackONv1/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── server.js       # Main server file
│   ├── ml_service/         # Python ML service
│   │   ├── app.py          # Flask application
│   │   ├── ml_models/      # TensorFlow models
│   │   └── requirements.txt # Python dependencies
│   └── package.json        # Node.js dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── package.json       # Frontend dependencies
└── README.md              # This file
```

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hackon_db
JWT_SECRET=your_jwt_secret_here
ML_SERVICE_URL=http://localhost:5001
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_ML_SERVICE_URL=http://localhost:5001
```

## 🚀 Available Scripts

### Backend
```bash
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm run test         # Run tests
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### ML Service
```bash
python app.py        # Start Flask development server
```

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  role: String (admin/seller),
  createdAt: Date,
  updatedAt: Date
}
```

### Sellers Collection
```javascript
{
  _id: ObjectId,
  sellerId: String,
  name: String,
  businessType: String,
  location: String,
  riskScore: Number,
  totalReviews: Number,
  fakeReviewPercentage: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Reviews Collection
```javascript
{
  _id: ObjectId,
  reviewId: String,
  sellerId: String,
  productId: String,
  rating: Number,
  text: String,
  isFake: Boolean,
  confidence: Number,
  detectionMethod: String,
  createdAt: Date
}
```

### Delivery Violations Collection
```javascript
{
  _id: ObjectId,
  violationId: String,
  sellerId: String,
  violationType: String,
  description: String,
  severity: String,
  riskScore: Number,
  createdAt: Date
}
```

## 🔧 Development

### Adding New Features

1. **Backend API:**
   - Add routes in `backend/src/routes/`
   - Add controllers in `backend/src/controllers/`
   - Add models in `backend/src/models/`

2. **Frontend Components:**
   - Add components in `frontend/src/components/`
   - Add pages in `frontend/src/pages/`
   - Update types in `frontend/src/types/`

3. **ML Models:**
   - Add new models in `backend/ml_service/ml_models/`
   - Update `app.py` to load new models

### Code Style

- **Backend**: Use ESLint and Prettier
- **Frontend**: Use TypeScript strict mode
- **Python**: Follow PEP 8 guidelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Ensure all services are running on the correct ports
3. Verify your environment variables are set correctly
4. Check the browser console and server logs for errors

For additional help, please open an issue on GitHub.

## 👥 Team Nameless

- **Vayuj Dhir** 

---

**Built with ❤️ for Amazon HackON 2025**
