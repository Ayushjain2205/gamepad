import { GameDefinition } from "../types";

export const wordleGame: GameDefinition = {
  id: "wordle",
  name: "Word Game",
  code: `const WordleGame = () => {
  const [gameState, setGameState] = useState("playing"); // playing, won, lost
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [usedLetters, setUsedLetters] = useState({});
  
  // Word list - simple 5-letter words
  const words = [
    "APPLE", "BRAIN", "CHAIR", "DANCE", "EARTH", "FRUIT", "GHOST", "HEART",
    "IMAGE", "JUICE", "KNIFE", "LIGHT", "MAGIC", "NIGHT", "OCEAN", "POWER",
    "QUEST", "RIVER", "SMILE", "TABLE", "UNION", "VALUE", "WATER", "YOUTH", "ZEBRA"
  ];
  
  const [targetWord, setTargetWord] = useState("");
  
  const initializeGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setTargetWord(randomWord);
    setGameState("playing");
    setCurrentGuess("");
    setGuesses([]);
    setCurrentRow(0);
    setUsedLetters({});
    setGameStarted(true);
  };
  
  
  const handleKeyPress = (key) => {
    if (gameState !== "playing") return;
    
    if (key === "ENTER") {
      if (currentGuess.length === 5) {
        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);
        
        // Update used letters with their status
        const newUsedLetters = { ...usedLetters };
        for (let i = 0; i < 5; i++) {
          const letter = currentGuess[i];
          const status = getLetterStatus(letter, i, currentGuess);
          // Keep the best status for each letter
          if (!newUsedLetters[letter] || 
              (newUsedLetters[letter] !== "correct" && status === "correct") ||
              (newUsedLetters[letter] === "absent" && status === "present")) {
            newUsedLetters[letter] = status;
          }
        }
        setUsedLetters(newUsedLetters);
        
        setCurrentGuess("");
        setCurrentRow(currentRow + 1);
        
        if (currentGuess === targetWord) {
          setGameState("won");
        } else if (currentRow === 5) {
          setGameState("lost");
        }
      }
    } else if (key === "BACKSPACE") {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (key.length === 1 && /[A-Z]/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(currentGuess + key);
    }
  };
  
  const getLetterStatus = (letter, position, guess) => {
    if (targetWord[position] === letter) {
      return "correct";
    } else if (targetWord.includes(letter)) {
      return "present";
    } else {
      return "absent";
    }
  };
  
  
  const resetGame = () => {
    setGameStarted(false);
    setGameState("playing");
  };
  
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      boxSizing: "border-box"
    }}>
      
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "30px",
        color: "white",
        fontSize: "18px",
        fontWeight: "bold"
      }}>
        <div>📝 {currentRow}/6</div>
      </div>
      
      {!gameStarted ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          textAlign: "center"
        }}>
          <div style={{
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "40px",
            borderRadius: "20px",
            fontSize: "24px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
          }} onClick={initializeGame}>
            🔤 START WORD GAME
          </div>
        </div>
      ) : gameState === "won" ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          textAlign: "center"
        }}>
          <div style={{
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "40px",
            borderRadius: "20px",
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "20px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
          }}>
            🎉 YOU WON!
          </div>
          <div style={{
            color: "white",
            fontSize: "18px",
            marginBottom: "20px"
          }}>
            Word was: <strong>{targetWord}</strong>
          </div>
          <div 
            onClick={resetGame}
            style={{
              background: "linear-gradient(45deg, #FF6B6B, #FF8E53)",
              color: "white",
              padding: "15px 30px",
              borderRadius: "25px",
              cursor: "pointer",
              fontSize: "18px",
              fontWeight: "bold",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)"
            }}
          >
            PLAY AGAIN
          </div>
        </div>
      ) : gameState === "lost" ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          textAlign: "center"
        }}>
          <div style={{
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "40px",
            borderRadius: "20px",
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "20px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
          }}>
            💀 GAME OVER
          </div>
          <div style={{
            color: "white",
            fontSize: "18px",
            marginBottom: "20px"
          }}>
            Word was: <strong>{targetWord}</strong>
          </div>
          <div 
            onClick={resetGame}
            style={{
              background: "linear-gradient(45deg, #FF6B6B, #FF8E53)",
              color: "white",
              padding: "15px 30px",
              borderRadius: "25px",
              cursor: "pointer",
              fontSize: "18px",
              fontWeight: "bold",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)"
            }}
          >
            TRY AGAIN
          </div>
        </div>
      ) : (
        <>
          {/* Game Board */}
          <div style={{
            display: "grid",
            gridTemplateRows: "repeat(6, 1fr)",
            gap: "8px",
            marginBottom: "30px"
          }}>
            {Array.from({ length: 6 }, (_, rowIndex) => (
              <div key={rowIndex} style={{ display: "flex", gap: "8px" }}>
                {Array.from({ length: 5 }, (_, colIndex) => {
                  const letter = rowIndex < guesses.length 
                    ? guesses[rowIndex][colIndex] 
                    : rowIndex === currentRow 
                      ? currentGuess[colIndex] 
                      : "";
                  
                  const status = rowIndex < guesses.length 
                    ? getLetterStatus(guesses[rowIndex][colIndex], colIndex, guesses[rowIndex])
                    : null;
                  
                  return (
                    <div
                      key={colIndex}
                      style={{
                        width: "50px",
                        height: "50px",
                        border: "2px solid #3a3a3c",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "white",
                        backgroundColor: status === "correct" ? "#538d4e" :
                                       status === "present" ? "#b59f3b" :
                                       status === "absent" ? "#3a3a3c" : "#121213",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          
          {/* Keyboard */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            {["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row, rowIndex) => (
              <div key={rowIndex} style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                {row.split("").map((key) => {
                  const letterStatus = usedLetters[key];
                  let backgroundColor = "#818384";
                  if (letterStatus === "correct") backgroundColor = "#538d4e";
                  else if (letterStatus === "present") backgroundColor = "#b59f3b";
                  else if (letterStatus === "absent") backgroundColor = "#3a3a3c";
                  
                  return (
                    <button
                      key={key}
                      onClick={() => handleKeyPress(key)}
                      style={{
                        padding: "12px 8px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        border: "none",
                        borderRadius: "4px",
                        backgroundColor: backgroundColor,
                        color: "white",
                        cursor: "pointer",
                        minWidth: "32px",
                        transition: "all 0.2s ease"
                      }}
                      onMouseOver={(e) => {
                        if (backgroundColor === "#818384") {
                          e.target.style.backgroundColor = "#6b6d6e";
                        }
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = backgroundColor;
                      }}
                    >
                      {key}
                    </button>
                  );
                })}
                {rowIndex === 2 && (
                  <>
                    <button
                      onClick={() => handleKeyPress("ENTER")}
                      style={{
                        padding: "12px 16px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        border: "none",
                        borderRadius: "4px",
                        backgroundColor: "#818384",
                        color: "white",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      ENTER
                    </button>
                    <button
                      onClick={() => handleKeyPress("BACKSPACE")}
                      style={{
                        padding: "12px 16px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        border: "none",
                        borderRadius: "4px",
                        backgroundColor: "#818384",
                        color: "white",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      ⌫
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};`,
  metadata: {
    difficulty: "Medium",
    description:
      "Guess the 5-letter word in 6 tries. Green = correct letter and position, yellow = correct letter wrong position",
    icon: "🔤",
    category: "Word",
    tags: ["word", "puzzle", "guessing", "letters", "brain"],
    estimatedPlayTime: "3-5 minutes",
  },
};
