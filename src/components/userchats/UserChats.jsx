import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './UserChats.css';

// Create your API key at https://makersuite.google.com/app/apikey
// Replace this with your actual API key
const GEMINI_API_KEY = ;

function UserChats() {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [messages, setMessages] = useState([]);
  const [showText, setShowText] = useState(true);
  const recognitionRef = useRef(null);
  const originalTextRef = useRef({});
  
  // Initialize Gemini only if API key is present
  const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
  const model = genAI ? genAI.getGenerativeModel({ model: "gemini-pro" }) : null;

  const SYSTEM_CONTEXT = "You are a supportive AI companion. Keep responses brief and conversational, like a friend. Avoid long explanations. Ask occasional follow-up questions to keep the conversation flowing naturally. Limit responses to 1-2 short sentences unless specifically asked for more detail.";

  const filterProfanity = (text) => {
    const profanityList = ['fuck', 'shit', 'ass', 'damn', 'bitch', 'cunt', 'dick'];
    let filteredText = text.toLowerCase();
    profanityList.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    });
    return filteredText;
  };

  const speakText = (text, messageId) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(originalTextRef.current[messageId] || text);
      utterance.rate = 1.1;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  };

  const getAIResponse = async (text) => {
    try {
      if (!model) {
        return "API key not configured. Please add your Gemini API key.";
      }

      const prompt = `${SYSTEM_CONTEXT}\n\nUser: ${text}\nAssistant:`;
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      return response.length > 100 ? response.substring(0, 100) + '...' : response;
    } catch (error) {
      console.error('Error fetching AI response:', error);
      return "I'm having trouble connecting. Please check your API key and try again.";
    }
  };

  const typeResponse = (text) => {
    let index = 0;
    setDisplayedResponse('');
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedResponse((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30);
  };

  const handleSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlaying(false);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = async (event) => {
      try {
        const transcript = event.results[0][0].transcript;
        recognition.stop();
        setIsListening(false);
        recognitionRef.current = null;

        const messageId = Date.now();
        originalTextRef.current[messageId] = transcript;
        setMessages((prevMessages) => [...prevMessages, { id: messageId, sender: 'user', text: filterProfanity(transcript) }]);

        const aiResponse = await getAIResponse(transcript);
        const responseId = Date.now();
        originalTextRef.current[responseId] = aiResponse;
        setMessages((prevMessages) => [...prevMessages, { id: responseId, sender: 'ai', text: filterProfanity(aiResponse) }]);
        typeResponse(filterProfanity(aiResponse));
        speakText(aiResponse, responseId);
      } catch (error) {
        console.error('Error processing speech:', error);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  return (
    <div className="app-container">
      <div className="chat-container">
        <div className="glass-ball-wrapper">
          <div className="glass-ball">
            <div className="glass-reflection"></div>
          </div>
        </div>

        <h1 className="chat-title">Chat With Me</h1>
        
        <div className="button-container">
          <button 
            className={`chat-button ${isListening ? 'listening' : ''}`} 
            onClick={handleSpeech}
          >
            {isListening ? '🎤 Listening...' : '🎤 Talk'}
          </button>
          <button 
            className="chat-button"
            onClick={() => setShowText(!showText)}
          >
            {showText ? 'Hide Text' : 'Show Text'}
          </button>
        </div>

        {showText && (
          <div className="messages-container">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender}`}
              >
                {message.text}
              </div>
            ))}
            {displayedResponse && (
              <div className="message ai typing">
                {displayedResponse}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserChats;