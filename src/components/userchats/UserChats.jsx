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

  const SYSTEM_CONTEXT = "Here are the revised, shorter journal entries: January 12, 2025 I promised I wouldn’t bet again, but I placed $50 on the Lakers to win tonight’s game against the Warriors. I know the odds are slim, but I couldn’t resist. If they win, I’ll feel great, but if they lose, I’ll feel stupid. I keep saying I’ll stop, but it never works. January 14, 2025 I went to the casino to play blackjack, thinking it would be just a few rounds. But after a few losses, I kept playing to win it back. I ended up losing $200. I can’t help but chase the wins, and every time I lose, I think the next hand will be the one. January 16, 2025 I played poker online again. I started with $20, but after winning a few hands, I got carried away. I ended up losing $150. I thought I could control it, but the rush kept me going, and I lost it all. I’m worried about where this is heading. January 18, 2025 I went to the racetrack today. I started with $40 and won $60, but then I kept placing bigger bets, hoping to win more. By the end of the day, I lost $200. I keep telling myself I’m done, but I always end up going back for more. These entries focus on the key moments while keeping them concise. Here are some concise journal entries focusing on procrastination: January 12, 2025 I knew I had to start my Math IA today, but I kept telling myself I’d do it in an hour. Hours passed, and now it’s almost midnight. I feel anxious, but I still can’t bring myself to work on it. I keep thinking it’ll be fine, but I know I’m just digging myself into a deeper hole. January 14, 2025 I have that big TOK essay due in a few days, and I still haven’t started. Instead of writing, I’ve been scrolling through my phone, getting distracted by everything. It’s frustrating because I know how important it is, but I just can’t get the motivation to dive in. The deadline is looming, but I keep putting it off. January 16, 2025 I told myself I’d study for my Language and Literature exam today, but instead, I ended up watching a movie. Now I’m feeling guilty, but I can’t seem to focus. I’m stuck in a cycle of saying I’ll get to it later, but “later” never comes. I’m just avoiding it because I’m overwhelmed. January 18, 2025 I’ve been putting off my project for Deltahacks for days. Every time I sit down to work, I just end up doing something else. I keep telling myself I’ll start after a short break, but the break turns into hours of nothing productive. I know I need to get moving, but I just can’t push myself to start. These entries capture the internal struggle and the cycle of procrastination while keeping them brief. When respoding, when needed clarify and ask more questions about the users problems, then after the user replies and answers your question give him solutions. If the user is specific already in his prompt then you dont have to ask questions. For example if the user gives a specific story or context then you don't have to keep asking questions, but if they dont then ask questions. Dont give a numbered list of what to do, it sounds redundant. If user asks questions that will only make their problems worse, tell them that as you therapist ai you cannot answer questions that can potentially make their problem worse.";

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
