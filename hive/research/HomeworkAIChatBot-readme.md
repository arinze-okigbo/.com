# 🎓 Homework Chatbot

A smart AI-powered homework assistant built with FastAPI and Gemini AI that helps students understand and solve homework problems across various subjects.

## ✨ Features

- **Natural Language Input**: Ask questions in plain English
- **Subject Detection**: Automatically detects math, science, history, and literature
- **Step-by-Step Solutions**: Detailed explanations for math and science problems
- **Citation Feature**: Referenced facts for history and literature
- **Tone Control**: Choose between simple explanations and detailed answers
- **Session Memory**: Maintains conversation context
- **Rate Limiting**: Prevents abuse with request limits
- **Beautiful UI**: Modern, responsive web interface

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Gemini AI API key

### Installation

1. **Clone or download the project**
   ```bash
   cd homework-chatbot
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp env_example.txt .env
   ```
   
   Edit `.env` and add your Gemini AI API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Run the application**
   ```bash
   python main.py
   ```

5. **Open your browser**
   Navigate to `http://localhost:8000`

## 🔧 Configuration

### Environment Variables

- `GEMINI_API_KEY`: Your Gemini AI API key (required)
- `REDIS_URL`: Redis connection URL (optional, for session storage)
- `MAX_REQUESTS_PER_MINUTE`: Rate limit per minute (default: 30)
- `MAX_REQUESTS_PER_HOUR`: Rate limit per hour (default: 100)
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)

### Getting a Gemini AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file

## 📚 Supported Subjects

### Mathematics
- Algebra, calculus, geometry, trigonometry
- Step-by-step problem solving
- Formula explanations and derivations

**Example**: "Solve the equation 2x + 5 = 13"

### Science
- Physics, chemistry, biology
- Experimental procedures
- Scientific concepts and theories

**Example**: "Explain how photosynthesis works"

### History
- Historical events and figures
- Contextual analysis
- Referenced facts and sources

**Example**: "What were the main causes of World War I?"

### Literature
- Book analysis and interpretation
- Character development
- Literary devices and themes

**Example**: "Analyze the symbolism in The Great Gatsby"

## 🛠️ API Endpoints

### POST `/chat`
Send a message to the chatbot.

**Request Body:**
```json
{
  "message": "Solve 2x + 5 = 13",
  "session_id": "optional_session_id",
  "tone": "detailed",  // "simple" or "detailed"
  "subject": "mathematics"  // optional, auto-detected if not provided
}
```

**Response:**
```json
{
  "response": "Step-by-step solution...",
  "subject_detected": "mathematics",
  "session_id": "session_123",
  "timestamp": "2024-01-01T12:00:00",
  "tone_used": "detailed"
}
```

### GET `/subjects`
Get information about supported subjects.

### GET `/health`
Health check endpoint.

## 🎨 Features in Detail

### Subject Detection
The chatbot automatically detects the subject area based on keywords in your question:
- **Math**: equation, solve, formula, derivative, etc.
- **Science**: experiment, molecule, atom, force, etc.
- **History**: historical, war, civilization, revolution, etc.
- **Literature**: book, novel, character, theme, symbolism, etc.

### Tone Control
- **Simple Explanation**: Basic, easy-to-understand language
- **Detailed Answer**: Comprehensive explanations with thorough analysis

### Session Memory
The chatbot maintains conversation context within a session, allowing for follow-up questions and more natural conversations.

### Rate Limiting
Built-in rate limiting prevents abuse:
- 30 requests per minute
- 100 requests per hour
- Configurable via environment variables

## 🔒 Security Features

- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration for web security
- Session management with automatic cleanup

## 🚀 Deployment

### Local Development
```bash
python main.py
```

### Production Deployment
1. Set up a production server (e.g., Ubuntu with Python)
2. Install dependencies: `pip install -r requirements.txt`
3. Set environment variables
4. Run with a process manager like `systemd` or `supervisor`
5. Use a reverse proxy like Nginx

### Docker Deployment (Optional)
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["python", "main.py"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is open source and available under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY environment variable is required"**
   - Make sure you've created a `.env` file with your API key

2. **Rate limit exceeded**
   - Wait a minute before making more requests
   - Check your rate limit settings in the `.env` file

3. **Import errors**
   - Make sure all dependencies are installed: `pip install -r requirements.txt`

4. **Port already in use**
   - Change the port in your `.env` file or kill the process using the port

### Getting Help

If you encounter issues:
1. Check the console output for error messages
2. Verify your API key is correct
3. Ensure all dependencies are installed
4. Check that the port isn't already in use

## 🎯 Future Enhancements

- [ ] Multi-language support
- [ ] File upload for homework problems
- [ ] Integration with learning management systems
- [ ] Advanced analytics and progress tracking
- [ ] Mobile app version
- [ ] Voice input/output capabilities 