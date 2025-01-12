import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './UserChats.css';

// Replace with your API key
const GEMINI_API_KEY = "AIzaSyA7pif1PLPm4-a9DjFcGOICS7uK7oE5bQY";

function UserChats() {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showText, setShowText] = useState(true);
  const recognitionRef = useRef(null);

  // Initialize Gemini if the API key is present
  const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
  const model = genAI ? genAI.getGenerativeModel({ model: "gemini-pro" }) : null;

  const SYSTEM_CONTEXT = "You are a therapist. Your patient has a gambling addiction and is also a chronic procrastinator. Here are some problems when gambling: January 12, 2025: Placed a $50 bet on the Lakers vs. Warriors game despite promising to stop. Acknowledged the slim odds but couldn’t resist the temptation. Feels stuck in a cycle of betting and regret. January 14, 2025: Went to the casino to play blackjack, intending to stop after a few rounds. Kept playing after losing, trying to win back losses. Lost $200, chasing the idea that the next hand would turn things around. January 16, 2025: Played online poker, starting with a small $20 bet. Won a few hands but got carried away and ultimately lost $150. Recognizes the dangerous allure of the gambling rush. January 18, 2025: Bet on horse races, starting with $40 and winning $60 initially. Continued betting larger amounts, chasing bigger wins. Ended the day with a $200 loss, despite intentions to stop. Now here are some problems with procrastination: January 12, 2025: Planned to start the Math IA but kept delaying it. Hours passed, and it was nearly midnight with no progress. Feels anxious and acknowledges making things worse by procrastinating. January 14, 2025: Scrolled through the phone instead of starting a big TOK essay. Aware of the essay’s importance but lacks motivation to begin. Deadline is approaching, creating frustration and stress. January 16, 2025: Planned to study for a Language and Literature exam but watched a movie instead. Feels guilty for avoiding studying and overwhelmed by the task. Stuck in a cycle of postponing work while feeling unproductive. January 18, 2025: Procrastinated on the Deltahacks project for several days. Short breaks turned into long periods of distraction and inactivity. Recognizes the need to start but struggles with motivation.";

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
