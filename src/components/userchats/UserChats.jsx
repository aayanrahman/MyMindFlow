import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './UserChats.css';

// Replace with your API key
const GEMINI_API_KEY = "just put the fries in the bag";

function UserChats() {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showText, setShowText] = useState(true);
  const recognitionRef = useRef(null);

  // Initialize Gemini if the API key is present
  const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
  const model = genAI ? genAI.getGenerativeModel({ model: "gemini-pro" }) : null;

  const SYSTEM_CONTEXT = "I can't seem to stay away from it, no matter how much I tell myself it's the last time. Just a small bet, I tell myself. It’s not like I’m going to lose anything big. But then, it never feels small. After I win, I feel this rush, this high, like I’m on top of the world. But when I lose, the weight of it sinks in. I tell myself I’ll stop tomorrow, but tomorrow never comes. It’s been a few days, but I’m already feeling the pull again. I found myself checking the odds for tonight’s game, just out of curiosity. Of course, curiosity quickly turns into action. I promised I wouldn’t, but here I am. It’s like I’m stuck in a cycle, constantly chasing that win. I know it’s hurting me, but I can’t break free. I’ve lost track of how many times I’ve said, “I’ll stop after this one.” I always think this is the last bet, but the truth is, it’s never the last. Even when I win, it’s not enough. There’s always a need to bet more, to win more. The excitement of the gamble has become an addiction, and I feel trapped in it. I want to stop, but I don’t know how. I’m starting to feel numb to the losses. It's like I don't even care anymore. The wins don’t excite me the way they used to. I just keep going through the motions, always looking for the next game, the next chance. There’s a growing sense of emptiness inside, but I can’t figure out how to fill it without gambling. I’m afraid to admit it, but I think I might be addicted."
  ;

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
