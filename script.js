// API URL
const API_URL = "http://127.0.0.1:8000/chat";

// Chat history
let chatHistory = [];

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const examplesSection = document.getElementById('examplesSection');

// Auto-resize textarea
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Handle Enter key
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Send example
function sendExample(text) {
    messageInput.value = text;
    sendMessage();
}

// Send message
async function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Hide examples after first message
    if (chatHistory.length === 0) {
        examplesSection.style.display = 'none';
    }
    
    // Disable input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    sendBtn.disabled = true;
    
    // Add user message to UI
    addMessageToUI(message, 'user');
    
    // Add to history
    chatHistory.push({
        role: "user",
        content: message
    });
    
    // Show typing indicator
    typingIndicator.style.display = 'block';
    scrollToBottom();
    
    try {
        // Call API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                history: chatHistory
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        const botResponse = data.response || "Sorry, I couldn't process your request.";
        
        // Hide typing indicator
        typingIndicator.style.display = 'none';
        
        // Add bot response to UI
        addMessageToUI(botResponse, 'bot');
        
        // Add to history
        chatHistory.push({
            role: "assistant",
            content: botResponse
        });
        
    } catch (error) {
        console.error('Error:', error);
        typingIndicator.style.display = 'none';
        
        const errorMessage = "❌ ERROR: Unable to connect to the server. Please try again later or contact admin for support.";
        addMessageToUI(errorMessage, 'bot');
        
        chatHistory.push({
            role: "assistant",
            content: errorMessage
        });
    }
    
    // Re-enable input
    sendBtn.disabled = false;
    messageInput.focus();
}

// Add message to UI
function addMessageToUI(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = `message-avatar ${sender}-avatar`;
    avatarDiv.innerHTML = sender === 'bot' 
        ? '<i class="fas fa-robot"></i>' 
        : '<i class="fas fa-user"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = `message-bubble ${sender}-bubble`;
    
    // Parse text for basic formatting
    const formattedText = formatMessage(text);
    bubbleDiv.innerHTML = formattedText;
    
    contentDiv.appendChild(bubbleDiv);
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Format message (basic markdown support)
function formatMessage(text) {
    // Convert line breaks
    text = text.replace(/\n/g, '<br>');
    
    // Bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return text;
}

// Scroll to bottom
function scrollToBottom() {
    setTimeout(() => {
        chatMessages.parentElement.scrollTop = chatMessages.parentElement.scrollHeight;
    }, 100);
}

// Clear chat
function clearChat() {
    if (confirm('Are you sure you want to clear the entire conversation?')) {
        chatHistory = [];
        chatMessages.innerHTML = `
            <div class="message bot-message">
                <div class="message-avatar bot-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-bubble bot-bubble">
                        <p>👋 Hello! I'm ReframeBot. I'm here to help you reframe negative thoughts about academic stress. Feel free to share with me!</p>
                    </div>
                </div>
            </div>
        `;
        examplesSection.style.display = 'block';
        messageInput.value = '';
        messageInput.style.height = 'auto';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    messageInput.focus();
});
