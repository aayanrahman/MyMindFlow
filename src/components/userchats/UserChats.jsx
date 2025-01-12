import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './userChats.css';



const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function UserChats() {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [messages, setMessages] = useState([]);
  const [showText, setShowText] = useState(true);
  const recognitionRef = useRef(null);
  const originalTextRef = useRef({});

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
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(originalTextRef.current[messageId] || text);
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
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
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  const getAIResponse = async (text) => {
    try {
      const result = await model.generateContent(text);
      return result.response.text();
    } catch (error) {
      console.error('Error fetching AI response:', error);
      return 'Sorry, there was an error processing your request.';
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
    }, 50);
  };

  return (
    <div className="user-chats">
      <div className="glass-ball-container">
        <div className="glass-ball"></div>
      </div>
      <h1>User Chats</h1>
      <div className="controls">
        <button className='speak-btn' onClick={handleSpeech}>
          {isListening ? 'Listening...' : 'Talk'}
        </button>
        <button onClick={() => setShowText(!showText)}>
          {showText ? 'Hide Text' : 'Show Text'}
        </button>
      </div>
      {showText && (
        <>
          <div className="chat-window">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                {message.text}
              </div>
            ))}
          </div>
          <p>{displayedResponse}</p>
        </>
      )}
    </div>
  );
}

export default UserChats;