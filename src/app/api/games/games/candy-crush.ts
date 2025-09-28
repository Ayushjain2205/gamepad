import { GameDefinition } from "../types";

export const candyCrushGame: GameDefinition = {
  id: "candy-crush",
  name: "🍭 Candy Crush",
  code: `const CandyCrush = () => {
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCandy, setSelectedCandy] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetScore, setTargetScore] = useState(1000);
  const [matchedCandies, setMatchedCandies] = useState(new Set());
  const [isProcessingMatches, setIsProcessingMatches] = useState(false);
  const [explodingCandies, setExplodingCandies] = useState(new Set());
  const scoreRef = useRef(0);

  const BOARD_SIZE = 6;
  const CANDY_TYPES = ['🌹', '🌻', '🌷', '🌸', '🌺', '🌼', '🌿', '🌾'];
  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

  const initializeBoard = () => {
    const newBoard = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      const boardRow = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        let candyType;
        do {
          candyType = Math.floor(Math.random() * CANDY_TYPES.length);
        } while (
          (row >= 2 && 
           newBoard[row - 1][col] === candyType && 
           newBoard[row - 2][col] === candyType) ||
          (col >= 2 && 
           boardRow[col - 1] === candyType && 
           boardRow[col - 2] === candyType)
        );
        boardRow.push(candyType);
      }
      newBoard.push(boardRow);
    }
    return newBoard;
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    scoreRef.current = 0;
    setMoves(30);
    setTargetScore(1000);
    setBoard(initializeBoard());
    setSelectedCandy(null);
  };

  const findMatches = (board) => {
    const matches = new Set();
    
    // Check horizontal matches
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE - 2; col++) {
        if (board[row][col] !== -1 && 
            board[row][col] === board[row][col + 1] && 
            board[row][col] === board[row][col + 2]) {
          matches.add(\`\${row}-\${col}\`);
          matches.add(\`\${row}-\${col + 1}\`);
          matches.add(\`\${row}-\${col + 2}\`);
        }
      }
    }
    
    // Check vertical matches
    for (let row = 0; row < BOARD_SIZE - 2; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] !== -1 && 
            board[row][col] === board[row + 1][col] && 
            board[row][col] === board[row + 2][col]) {
          matches.add(\`\${row}-\${col}\`);
          matches.add(\`\${row + 1}-\${col}\`);
          matches.add(\`\${row + 2}-\${col}\`);
        }
      }
    }
    
    return matches;
  };

  const processMatchesWithAnimation = async (board) => {
    setIsProcessingMatches(true);
    let currentBoard = board;
    let totalScore = 0;
    let totalMatches = 0;
    
    while (true) {
      const matches = findMatches(currentBoard);
      if (matches.size === 0) break;
      
      // Show matched candies with highlight
      setMatchedCandies(matches);
      totalMatches += matches.size;
      totalScore += matches.size * 10;
      
      // Wait for highlight animation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Start explosion animation
      setExplodingCandies(matches);
      setMatchedCandies(new Set());
      
      // Wait for explosion animation
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Clear explosion and process the board normally
      setExplodingCandies(new Set());
      
      // Remove matched candies
      const newBoard = currentBoard.map(row => [...row]);
      matches.forEach(match => {
        const [row, col] = match.split('-').map(Number);
        newBoard[row][col] = -1; // Mark as empty
      });
      
      // Drop candies down normally
      for (let col = 0; col < BOARD_SIZE; col++) {
        let writeIndex = BOARD_SIZE - 1;
        
        for (let row = BOARD_SIZE - 1; row >= 0; row--) {
          if (newBoard[row][col] !== -1) {
            newBoard[writeIndex][col] = newBoard[row][col];
            if (writeIndex !== row) {
              newBoard[row][col] = -1;
            }
            writeIndex--;
          }
        }
        
        // Fill empty spaces with new candies
        for (let row = writeIndex; row >= 0; row--) {
          newBoard[row][col] = Math.floor(Math.random() * CANDY_TYPES.length);
        }
      }
      
      currentBoard = newBoard;
      setBoard(currentBoard);
      
      // Wait for settle animation
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsProcessingMatches(false);
    return { board: currentBoard, score: totalScore, matches: totalMatches };
  };

  const handleCandyClick = async (row, col) => {
    if (isAnimating || moves <= 0 || isProcessingMatches) return;
    
    if (selectedCandy === null) {
      setSelectedCandy({ row, col });
    } else {
      const { row: selectedRow, col: selectedCol } = selectedCandy;
      
      // Check if it's a valid swap (adjacent)
      const isAdjacent = 
        (Math.abs(row - selectedRow) === 1 && col === selectedCol) ||
        (Math.abs(col - selectedCol) === 1 && row === selectedRow);
      
      if (isAdjacent) {
        setIsAnimating(true);
        
        // Swap candies
        const newBoard = board.map(row => [...row]);
        const temp = newBoard[row][col];
        newBoard[row][col] = newBoard[selectedRow][selectedCol];
        newBoard[selectedRow][selectedCol] = temp;
        setBoard(newBoard);
        
        // Check for matches after swap
        const matches = findMatches(newBoard);
        
        if (matches.size > 0) {
          // Process matches with animation
          const result = await processMatchesWithAnimation(newBoard);
          setScore(prev => {
            const newScore = prev + result.score;
            scoreRef.current = newScore;
            return newScore;
          });
        } else {
          // Swap back if no matches
          await new Promise(resolve => setTimeout(resolve, 300));
          const revertBoard = newBoard.map(row => [...row]);
          revertBoard[row][col] = newBoard[selectedRow][selectedCol];
          revertBoard[selectedRow][selectedCol] = newBoard[row][col];
          setBoard(revertBoard);
        }
        
        // Always decrement moves, whether successful or not
        setMoves(prev => prev - 1);
        
        setSelectedCandy(null);
        setIsAnimating(false);
      } else {
        setSelectedCandy({ row, col });
      }
    }
  };

  const sendScoreMessage = (score) => {
    if (window.parent) {
      window.parent.postMessage({
        type: 'GAME_SCORE',
        data: { 
          gameId: 'candy-crush',
          score: score,
          timestamp: Date.now()
        }
      }, '*');
    }
  };

  const isGameWon = score >= targetScore;
  const isGameLost = moves <= 0 && score < targetScore;

  // Send score when game ends
  useEffect(() => {
    if (isGameWon || isGameLost) {
      sendScoreMessage(scoreRef.current);
    }
  }, [isGameWon, isGameLost]);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "Arial, sans-serif",
      position: "relative",
      overflow: "hidden",
      touchAction: "manipulation",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      boxSizing: "border-box"
    }}>
      <style>
        {\`
          @keyframes pulse {
            0% { transform: scale(1); }
            100% { transform: scale(1.1); }
          }
          @keyframes blastOff {
            0% { 
              transform: scale(1) rotate(0deg); 
              opacity: 1; 
            }
            50% { 
              transform: scale(1.5) rotate(180deg); 
              opacity: 0.8; 
            }
            100% { 
              transform: scale(0) rotate(360deg); 
              opacity: 0; 
            }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .exploding {
            animation: blastOff 0.4s ease-out forwards;
          }
        \`}
      </style>
      {!gameStarted ? (
        <div 
          onClick={startGame}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "40px",
            borderRadius: "20px",
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "bold",
            cursor: "pointer",
            zIndex: 10
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>🍭</div>
          <div>Start Candy Crush!</div>
          <div style={{ fontSize: "16px", marginTop: "10px", opacity: 0.8 }}>
            Match 3 or more candies to score points!
          </div>
        </div>
      ) : (
        <>
          {/* Game Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: "600px",
            marginBottom: "20px",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
          }}>
            <div>Score: {score}</div>
            <div>Target: {targetScore}</div>
            <div>Moves: {moves}</div>
          </div>


          {/* Game Board */}
          <div style={{
            display: "grid",
            gridTemplateColumns: \`repeat(\${BOARD_SIZE}, 1fr)\`,
            gap: "4px",
            background: "rgba(0,0,0,0.3)",
            padding: "10px",
            borderRadius: "15px",
            border: "3px solid rgba(255,255,255,0.3)"
          }}>
            {board.map((row, rowIndex) =>
              row.map((candyType, colIndex) => {
                const isSelected = selectedCandy?.row === rowIndex && selectedCandy?.col === colIndex;
                const isMatched = matchedCandies.has(\`\${rowIndex}-\${colIndex}\`);
                const isExploding = explodingCandies.has(\`\${rowIndex}-\${colIndex}\`);
                const isProcessing = isProcessingMatches;
                
                // Don't render if exploding (will be handled by explosion animation)
                if (isExploding) {
                  return (
                    <div
                      key={\`exploding-\${rowIndex}-\${colIndex}\`}
                      className="exploding"
                      style={{
                        width: "50px",
                        height: "50px",
                        background: "linear-gradient(45deg, #FFD700, #FF6B6B)",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                        border: "3px solid #FF6B6B",
                        boxShadow: "0 0 20px #FF6B6B",
                        userSelect: "none",
                        touchAction: "manipulation",
                        position: "relative",
                        zIndex: 20
                      }}
                    >
                      💥
                    </div>
                  );
                }
                
                // Normal candy rendering
                return (
                  <div
                    key={\`\${rowIndex}-\${colIndex}\`}
                    onClick={() => handleCandyClick(rowIndex, colIndex)}
                    style={{
                      width: "50px",
                      height: "50px",
                      background: isMatched 
                        ? "linear-gradient(45deg, #FFD700, #FFA500)" 
                        : COLORS[candyType] || "#333",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      cursor: isProcessing ? "not-allowed" : "pointer",
                      border: isSelected 
                        ? "3px solid #FFD700" 
                        : isMatched
                        ? "3px solid #FF6B6B"
                        : "3px solid transparent",
                      boxShadow: isSelected
                        ? "0 0 15px #FFD700"
                        : isMatched
                        ? "0 0 15px #FF6B6B"
                        : "0 4px 8px rgba(0,0,0,0.3)",
                      transition: "all 0.3s ease",
                      userSelect: "none",
                      touchAction: "manipulation",
                      transform: isMatched ? "scale(1.1)" : "scale(1)",
                      opacity: isMatched ? 0.8 : 1,
                      animation: isMatched ? "pulse 0.3s infinite alternate" : "none",
                      position: "relative",
                      zIndex: 1
                    }}
                  >
                    {isMatched ? "✨" : CANDY_TYPES[candyType]}
                  </div>
                );
              })
            )}
          </div>

          {/* Game Over Screen */}
          {(isGameWon || isGameLost) && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(0,0,0,0.9)",
              color: "white",
              padding: "40px",
              borderRadius: "20px",
              textAlign: "center",
              fontSize: "24px",
              fontWeight: "bold",
              zIndex: 10
            }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                {isGameWon ? "🎉" : "😢"}
              </div>
              <div>{isGameWon ? "Congratulations!" : "Game Over!"}</div>
              <div style={{ fontSize: "18px", marginTop: "10px" }}>
                Final Score: {score}
              </div>
              <button
                onClick={startGame}
                style={{
                  background: "linear-gradient(45deg, #FF6B6B, #FF8E53)",
                  color: "white",
                  border: "none",
                  padding: "15px 30px",
                  borderRadius: "25px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginTop: "20px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
                }}
              >
                Play Again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};`,
  metadata: {
    difficulty: "Medium",
    description:
      "Match 3 or more candies to score points in this classic puzzle game",
    icon: "🍭",
    category: "Puzzle",
    tags: ["match-3", "puzzle", "candy", "strategy", "colorful"],
    estimatedPlayTime: "5-10 minutes",
  },
};
