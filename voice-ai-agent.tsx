import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Volume1, VolumeX } from 'lucide-react';

const VoiceAIAgent = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [history, setHistory] = useState([]);
  
  // References
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  
  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const text = result[0].transcript;
        setTranscript(text);
      };
      
      recognition.onend = () => {
        if (isListening) {
          processQuery(transcript);
        }
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, [isListening, transcript]);
  
  // Function to toggle listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };
  
  // Simple QA system - in a real app, this would call an external API
  const processQuery = (query) => {
    // Sample knowledge base - would be replaced with a real backend
    const knowledgeBase = {
      "what is your name": "My name is Rashmika. How can I help you today?",
      "what time is it": `The current time is ${new Date().toLocaleTimeString()}.`,
      "what is the weather": "I'm sorry, I don't have access to real-time weather data. You would need to integrate a weather API for that functionality.",
      "how are you": "I'm functioning well, thank you for asking. How are you today?",
      "tell me a joke": "Why don't scientists trust atoms? Because they make up everything!",
      "who created you": "I was created as a demonstration of a voice-based AI agent using React and web APIs.",
      "what can you do": "I can answer simple questions, provide information from my knowledge base, and respond to voice commands. My capabilities can be expanded with additional programming."
    };
    
    // Simple matching logic - would be replaced with a more sophisticated NLU system
    const normalizedQuery = query.toLowerCase().trim();
    let bestAnswer = "I'm sorry, I don't have an answer for that question. Please try asking something else.";
    
    // Check for exact matches
    if (knowledgeBase[normalizedQuery]) {
      bestAnswer = knowledgeBase[normalizedQuery];
    } else {
      // Check for partial matches
      for (const key in knowledgeBase) {
        if (normalizedQuery.includes(key)) {
          bestAnswer = knowledgeBase[key];
          break;
        }
      }
    }
    
    // Update state with the answer
    setAnswer(bestAnswer);
    
    // Add to history
    setHistory(prev => [...prev, { question: query, answer: bestAnswer }]);
    
    // Speak the answer
    speakText(bestAnswer);
  };
  
  // Function to speak text
  const speakText = (text) => {
    if (synthRef.current) {
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };
  
  // Stop speaking
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Rashmika AI Assistant</h1>
      
      {/* Voice input section */}
      <div className="w-full bg-gray-100 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Your Question</h2>
          <button
            onClick={toggleListening}
            className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
        </div>
        <div className="min-h-16 p-3 bg-white rounded border border-gray-300">
          {transcript || (isListening ? "Listening..." : "Click the microphone to ask a question")}
        </div>
      </div>
      
      {/* Answer section */}
      {answer && (
        <div className="w-full bg-blue-50 p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">AI Response</h2>
            <button
              onClick={isSpeaking ? stopSpeaking : () => speakText(answer)}
              className={`p-2 rounded-full ${isSpeaking ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
            >
              {isSpeaking ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>
          <div className="p-3 bg-white rounded border border-blue-300">
            {answer}
          </div>
        </div>
      )}
      
      {/* Conversation history */}
      {history.length > 0 && (
        <div className="w-full bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Conversation History</h2>
          <div className="space-y-3">
            {history.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-2">
                <p className="font-medium text-gray-700">Q: {item.question}</p>
                <p className="text-gray-600">A: {item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="w-full bg-yellow-50 p-4 rounded-lg text-sm">
        <h3 className="font-semibold mb-1">Try asking:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>What is your name?</li>
          <li>What time is it?</li>
          <li>Tell me a joke</li>
          <li>What can you do?</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceAIAgent;