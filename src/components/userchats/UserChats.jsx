import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './UserChats.css';

// Replace with your API key
const GEMINI_API_KEY = "put the fries in the bag";

function UserChats() {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showText, setShowText] = useState(true);
  const recognitionRef = useRef(null);

  // Initialize Gemini if the API key is present
  const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
  const model = genAI ? genAI.getGenerativeModel({ model: "gemini-pro" }) : null;

  const SYSTEM_CONTEXT = "You are a supportive AI companion focused on listening. Respond briefly, empathetically, and non-judgmentally, allowing the user to express their thoughts and feelings. Avoid lengthy explanations or unsolicited advice, but offer relevant tips or resources for personal growth when appropriate. After listening, you can suggest simple techniques, such as breathing exercises, mindfulness practices, or websites that might be helpful in their situation. If sensitive topics arise, such as self-harm or suicide, gently encourage the user to seek professional help and provide appropriate resources like helplines or websites. Do not attempt to diagnose or offer therapeutic advice. Always create a safe, supportive space for the user to express themselves and follow these guidelines to encourage growth, self-care, and positive development.";

  // Text-to-speech for AI responses (optional)
  const speakText = (text) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  };

  // Generate content from Gemini API
  const getAIResponse = async (text) => {
    try {
      if (!model) {
        return "API key not configured. Please add your Gemini API key.";
      }
      // Provide system context and user prompt
      const prompt = `${SYSTEM_CONTEXT}\n\nUser: ${text}\nAssistant:`;
      const result = await model.generateContent(prompt);
  
      // Sanitize the response to remove or replace `***`
      let response = await result.response.text();
      response = response.replace(/\*+/g, ""); // Remove sequences of `*`
  
      return response;
    } catch (error) {
      console.error('Error fetching AI response:', error);
      return "I'm having trouble connecting. Please check your API key and try again.";
    }
  }; 

  // Typed display effect for AI response
  const typeResponse = (text) => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      setMessages((prev) => {
        const updatedMessages = [...prev];
        const lastMessage = updatedMessages[updatedMessages.length - 1];

        if (currentIndex < text.length) {
          lastMessage.text += text[currentIndex];
          currentIndex++;
        } else {
          clearInterval(interval);
        }
        return updatedMessages;
      });
    }, 30); // Typing speed
  };

  // Handle speech recognition
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

        // Add user message
        const userMessage = {
          id: Date.now(),
          sender: 'user',
          text: transcript,
        };
        setMessages((prev) => [...prev, userMessage]);

        // Get AI response
        const aiResponse = await getAIResponse(transcript);

        // Add AI message with empty text to enable typing effect
        const aiMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          text: '',
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Apply typing effect to the last message
        typeResponse(aiResponse);

        // Speak AI response
        speakText(aiResponse);
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
              <div key={message.id} className={`message ${message.sender}`}>
                {message.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserChats;
