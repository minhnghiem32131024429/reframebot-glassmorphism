# ReframeBot 

A chatbot interface with glassmorphism design, powered by Llama 3.1 finetuned model to help students reframe negative thoughts about academic stress using CBT techniques.

## Features:
- **AI-Powered Chat** - Finetuned Llama 3.1 8B model
- **Real-time Chat** - Fast and responsive messaging
- **Responsive Design** - Works on all devices
- **RESTful API** - FastAPI backend

## Quick Start

### Prerequisites
- Python 3.11+
- CUDA-capable GPU (recommended)
- 16GB+ RAM

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/reframebot.git
cd reframebot
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the FastAPI server:
```bash
python app.py
```

4. Open the web interface:
   - Open `index.html` in your browser, OR
   - Run HTTP server: `python -m http.server 8080`
   - Navigate to: http://localhost:8080

## Project Structure

```
reframebot/
├── app.py              # FastAPI backend
├── index.html          # Main HTML file
├── style.css           # Glassmorphism styles
├── script.js           # Frontend logic
├── Utils/
│   └── Background.jpg  
├── requirements.txt    # Python dependencies
└── README.md          
```

## UI Features

- **Glassmorphism Design**: Frosted glass effect with backdrop blur
- **Custom Background**: Beautiful gradient or custom image support
- **Smooth Animations**: Floating bubbles and message animations
- **Hidden Scrollbars**: Clean, minimalist interface
- **Responsive Layout**: Adapts to all screen sizes

## Configuration

### Change API URL
Edit `script.js`:
```javascript
const API_URL = "http://your-domain.com/chat";
```

### Customize Colors
Edit `style.css` to change color scheme, glass effects, and more.

## Deployment

### Render.com 
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Deploy!


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

Nghiem Nhat Minh - [GitHub](https://github.com/minhnghiem32131024429)

## Acknowledgments

- Meta AI for Llama 3.1
- FastAPI team