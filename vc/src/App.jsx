import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const App = () => {
  const [currentPage, setCurrentPage] = useState('name');
  const [userName, setUserName] = useState('');
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [synthesisSupported, setSynthesisSupported] = useState(true);

  const recognitionRef = useRef(null);
  const nameContainerRef = useRef(null);
  const gameContainerRef = useRef(null);
  const questionRef = useRef(null);
  const resultRef = useRef(null);
  const inputRef = useRef(null);
  const nameInputRef = useRef(null);

  // GSAP Animations
  useEffect(() => {
    if (currentPage === 'name') {
      const tl = gsap.timeline();
      tl.fromTo('.name-title', 
        { opacity: 0, y: -50, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "back.out(1.7)" }
      )
      .fromTo('.name-subtitle',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.5"
      )
      .fromTo('.name-input-container',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" },
        "-=0.3"
      )
      .fromTo('.start-btn',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );

    } else if (currentPage === 'game') {
      const tl = gsap.timeline();
      tl.fromTo('.quiz-container',
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1, ease: "power2.out" }
      )
      .fromTo('.header h1',
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" },
        "-=0.5"
      )
      .fromTo('.user-welcome',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      )
      .fromTo('.question-container',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.3"
      )
      .fromTo('.controls',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.2"
      );

      // Male voice welcome message
      speakMessageWithMaleVoice(`Welcome ${userName}! Let's begin the math quiz.`);
      
      // Generate question after welcome message
      setTimeout(() => {
        generateQuestion();
      }, 2000);
    }
  }, [currentPage, userName]);

  // Check browser support and clean up recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setRecognitionSupported(false);
    }
    if (!('speechSynthesis' in window)) {
      setSynthesisSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      speechSynthesis.cancel();
    };
  }, []);

  // Get male voice function
  const getMaleVoice = () => {
    const voices = speechSynthesis.getVoices();
    // Prefer male voices - these are common male voice names across browsers
    const maleVoices = voices.filter(voice => 
      voice.name.includes('Google') && voice.name.includes('en') ||
      voice.name.includes('Microsoft') && voice.name.includes('David') ||
      voice.name.includes('Alex') ||
      voice.name.includes('Daniel') ||
      voice.name.includes('Fred') ||
      voice.name.toLowerCase().includes('male') ||
      voice.name.includes('en-GB') && voice.name.includes('Male')
    );
    
    return maleVoices.length > 0 ? maleVoices[0] : voices.find(voice => voice.lang.includes('en')) || voices[0];
  };

  // Speak with male voice
  const speakMessageWithMaleVoice = (text) => {
    if (!synthesisSupported) return;
    
    try {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 0.8; // Lower pitch for male voice
      utterance.volume = 1;
      
      const maleVoice = getMaleVoice();
      if (maleVoice) {
        utterance.voice = maleVoice;
        console.log('Using voice:', maleVoice.name);
      }
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.log('Speech error:', error);
    }
  };

  // Speak with default voice (for questions)
  const speakMessage = (text) => {
    if (!synthesisSupported) return;
    
    try {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1;
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.log('Speech error:', error);
    }
  };

  // Start game function
  const startGame = (e) => {
    if (e) e.preventDefault();
    
    if (userName.trim()) {
      const tl = gsap.timeline();
      tl.to(nameContainerRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        ease: "power2.in"
      })
      .then(() => {
        setCurrentPage('game');
      });
    }
  };

  // Generate random math question
  const generateQuestion = () => {
    const operations = [
      { symbol: '+', fn: (a, b) => a + b },
      { symbol: '-', fn: (a, b) => a - b },
      { symbol: '×', fn: (a, b) => a * b }
    ];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2;
    
    if (operation.symbol === '-') {
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * num1) + 1;
    } else {
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
    }
    
    const newQuestion = `${num1} ${operation.symbol} ${num2}`;
    const answer = operation.fn(num1, num2);
    
    setQuestion(newQuestion);
    setCorrectAnswer(answer);
    setUserAnswer('');
    setResult('');
    setVoiceFeedback('');
    
    // Stop any ongoing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    // Animate question entrance
    if (questionRef.current) {
      gsap.fromTo(questionRef.current,
        { opacity: 0, scale: 0.8, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
      );
    }
    
    // Speak the question with male voice after a short delay
    setTimeout(() => {
      speakMessageWithMaleVoice(`What is ${newQuestion}?`);
    }, 500);
  };

  // Smooth name input handling
  const handleNameChange = (e) => {
    const value = e.target.value;
    // Allow only letters and spaces, no numbers or special characters
    const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
    setUserName(filteredValue);
  };

  // Start voice recognition
  const startVoiceRecognition = () => {
    if (!recognitionSupported) {
      setVoiceFeedback('Voice recognition not supported in this browser');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
      return;
    }
    
    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setIsListening(true);
      setVoiceFeedback('Listening... Speak your answer now.');
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      console.log('Heard:', transcript);
      
      // Extract numbers from speech
      const numbers = transcript.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        const answer = parseInt(numbers[0]);
        setUserAnswer(answer.toString());
        checkAnswer(answer.toString());
      } else {
        // Handle word numbers
        const numberWords = {
          'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
          'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
          'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
          'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
          'to': 2, 'too': 2, 'for': 4, 'ate': 8 // Common mishearings
        };
        
        const wordMatch = Object.keys(numberWords).find(word => 
          transcript.includes(word)
        );
        
        if (wordMatch) {
          const answer = numberWords[wordMatch];
          setUserAnswer(answer.toString());
          checkAnswer(answer.toString());
        } else {
          setVoiceFeedback(`I heard: "${transcript}". Please say a number like "5" or "five".`);
          speakMessageWithMaleVoice(`I heard "${transcript}". Please say a number like five or ten.`);
        }
      }
    };
    
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error !== 'aborted') {
        setVoiceFeedback('Error with voice recognition. Please try again or use text input.');
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  // Check answer with GSAP animations
  const checkAnswer = (answer = userAnswer) => {
    const numericAnswer = parseInt(answer);
    if (isNaN(numericAnswer)) {
      setResult('Please enter a valid number');
      return;
    }

    setAttempts(prev => prev + 1);
    const isCorrect = numericAnswer === correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setResult('correct');
      
      // GSAP Correct Animation
      const tl = gsap.timeline();
      tl.to(resultRef.current, {
        scale: 1.2,
        duration: 0.3,
        ease: "back.out(2)"
      })
      .to(inputRef.current, {
        boxShadow: "0 0 30px rgba(0, 255, 136, 0.8)",
        borderColor: "#00ff88",
        duration: 0.3
      })
      .to(resultRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(inputRef.current, {
        boxShadow: "0 0 0px rgba(0, 255, 136, 0)",
        borderColor: "#00ff88",
        duration: 0.5
      }, "-=0.2");

      speakMessageWithMaleVoice("Correct! Well done!");
      setTimeout(generateQuestion, 2000);
    } else {
      setResult('wrong');
      
      // GSAP Wrong Animation
      const tl = gsap.timeline();
      tl.to(inputRef.current, {
        x: -10,
        duration: 0.1,
        ease: "power1.inOut"
      })
      .to(inputRef.current, {
        x: 10,
        duration: 0.1,
        ease: "power1.inOut"
      })
      .to(inputRef.current, {
        x: -8,
        duration: 0.1,
        ease: "power1.inOut"
      })
      .to(inputRef.current, {
        x: 8,
        duration: 0.1,
        ease: "power1.inOut"
      })
      .to(inputRef.current, {
        x: 0,
        duration: 0.1,
        ease: "power1.inOut"
      })
      .to(inputRef.current, {
        borderColor: "#ff6b6b",
        boxShadow: "0 0 20px rgba(255, 107, 107, 0.5)",
        duration: 0.2
      })
      .to(inputRef.current, {
        borderColor: "#00ff88",
        boxShadow: "0 0 0px rgba(255, 107, 107, 0)",
        duration: 0.3
      });

      speakMessageWithMaleVoice(`Wrong! The correct answer is ${correctAnswer}. Try the next one!`);
    }
  };

  // Reset quiz
  const resetQuiz = () => {
    const tl = gsap.timeline();
    tl.to('.quiz-container', {
      scale: 0.95,
      opacity: 0.8,
      duration: 0.3,
      ease: "power2.inOut"
    })
    .then(() => {
      setScore(0);
      setAttempts(0);
      setResult('');
      setUserAnswer('');
      speakMessageWithMaleVoice("Quiz reset! Let's start over!");
      generateQuestion();
    })
    .to('.quiz-container', {
      scale: 1,
      opacity: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (currentPage === 'name') {
        startGame(e);
      } else {
        checkAnswer();
      }
    }
  };

  // Name Entry Page
  if (currentPage === 'name') {
    return (
      <div className="app">
        <div ref={nameContainerRef} className="name-entry">
          <form onSubmit={startGame} className="name-container">
            <h1 className="name-title">🧮 Voice Math Quiz</h1>
            <p className="name-subtitle">Enter your name to begin the challenge</p>
            
            <div className="name-input-container">
              <input
                ref={nameInputRef}
                type="text"
                className="name-input"
                value={userName}
                onChange={handleNameChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your name here (letters only)..."
                maxLength={20}
                autoFocus
              />
            </div>
            
            <button 
              type="submit"
              className="start-btn"
              disabled={!userName.trim()}
            >
              Start Challenge
            </button>
            
            <div style={{marginTop: '20px', color: '#666', fontSize: '0.9rem'}}>
              💡 Tip: Use only letters for your name
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Game Page
  return (
    <div className="app">
      <div ref={gameContainerRef} className="quiz-container">
        <header className="header">
          <h1>🧮 Voice Math Quiz</h1>
          <p className="user-welcome">Welcome, {userName}!</p>
        </header>

        <div className="question-container">
          <div ref={questionRef} className="question">
            {question} = ?
          </div>
        </div>

        <div className="controls">
          <button 
            className="btn voice"
            onClick={startVoiceRecognition}
            disabled={!recognitionSupported || isListening}
            type="button"
          >
            🎤 {isListening ? 'Listening...' : 'Voice Answer'}
          </button>
          
          <button 
            className="btn secondary"
            onClick={() => checkAnswer()}
            disabled={!userAnswer}
            type="button"
          >
            ✅ Check Answer
          </button>
        </div>

        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            className="answer-input"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value.replace(/[^0-9-]/g, ''))}
            onKeyPress={handleKeyPress}
            placeholder="Or type your answer..."
          />
        </div>

        {voiceFeedback && (
          <div className="voice-feedback">
            {voiceFeedback}
          </div>
        )}

        {isListening && (
          <div className="recognition-status">
            🎤 Listening... Speak now
          </div>
        )}

        <div ref={resultRef} className={`result ${result}`}>
          {result === 'correct' && <>✅ Correct! Well done!</>}
          {result === 'wrong' && <>❌ Try again! Correct answer: {correctAnswer}</>}
        </div>

        <div className="stats">
          <div className="stat">
            <span className="stat-value">{score}</span>
            <span className="stat-label">Score</span>
          </div>
          <div className="stat">
            <span className="stat-value">{attempts}</span>
            <span className="stat-label">Attempts</span>
          </div>
          <div className="stat">
            <span className="stat-value">{attempts > 0 ? Math.round((score / attempts) * 100) : 0}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </div>

        <button className="btn" onClick={resetQuiz} type="button">
          🔄 Reset Quiz
        </button>

        <div className="accessibility-notice">
          <strong>Voice Tips:</strong> Say numbers like "5" or "five" or "twenty"
          {(!recognitionSupported || !synthesisSupported) && (
            <div style={{color: '#ff6b6b', marginTop: '10px'}}>
              ⚠️ Voice features limited in this browser
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;