import { GameDefinition } from "../types";

export const slidingPuzzleGame: GameDefinition = {
  id: "sliding-puzzle",
  name: "Image Puzzle",
  code: `const ImagePuzzle = () => {
  const [puzzle, setPuzzle] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);

  // Simple image URL
  const imageUrl = "https://picsum.photos/300/300";

  // Initialize puzzle with shuffled pieces
  const initializeGame = () => {
    const pieces = Array.from({ length: 9 }, (_, i) => i);
    const shuffled = pieces.sort(() => Math.random() - 0.5);
    setPuzzle(shuffled);
    setMoves(0);
    setTimeTaken(0);
    setGameStarted(true);
    setGameCompleted(false);
  };

  // Timer
  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      const timer = setInterval(() => {
        setTimeTaken(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted, gameCompleted]);

  // Handle piece click - select first piece, then swap with second
  const handlePieceClick = (clickedIndex) => {
    if (gameCompleted) return;
    
    if (selectedPiece === null) {
      // Select first piece
      setSelectedPiece(clickedIndex);
    } else if (selectedPiece === clickedIndex) {
      // Deselect if clicking the same piece
      setSelectedPiece(null);
    } else {
      // Swap the two pieces
      const newPuzzle = [...puzzle];
      [newPuzzle[selectedPiece], newPuzzle[clickedIndex]] = [newPuzzle[clickedIndex], newPuzzle[selectedPiece]];
      setPuzzle(newPuzzle);
      setMoves(prev => prev + 1);
      setSelectedPiece(null);
      
      // Check if solved
      if (newPuzzle.every((piece, index) => piece === index)) {
        setGameCompleted(true);
      }
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
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
        gap: "30px",
        width: "100%",
        maxWidth: "400px",
        marginBottom: "20px",
        color: "white",
        fontSize: "18px",
        fontWeight: "bold"
      }}>
        <div>🕒 {formatTime(timeTaken)}</div>
        <div>🔢 {moves} moves</div>
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
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            marginBottom: "20px"
          }} onClick={initializeGame}>
            🧩 START PUZZLE
          </div>
        </div>
      ) : gameCompleted ? (
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
            🎉 PUZZLE SOLVED!
          </div>
          <div style={{
            color: "white",
            fontSize: "18px",
            marginBottom: "20px"
          }}>
            Time: {formatTime(timeTaken)} | Moves: {moves}
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
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
              transition: "transform 0.2s"
            }}
            onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.target.style.transform = "scale(1)"}
          >
            PLAY AGAIN
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          width: "300px",
          height: "300px",
          border: "2px solid white",
          borderRadius: "8px",
          overflow: "hidden"
        }}>
          {puzzle.map((piece, index) => {
            const isCorrect = piece === index;
            const isSelected = selectedPiece === index;
            const pieceRow = Math.floor(piece / 3);
            const pieceCol = piece % 3;
            
            let backgroundColor = "rgba(255, 107, 107, 0.3)"; // Wrong position
            if (isCorrect) backgroundColor = "rgba(76, 205, 196, 0.3)"; // Correct position
            if (isSelected) backgroundColor = "rgba(255, 215, 0, 0.5)"; // Selected
            
            return (
              <div
                key={index}
                onClick={() => handlePieceClick(index)}
                style={{
                  width: "100px",
                  height: "100px",
                  backgroundImage: \`url(\${imageUrl})\`,
                  backgroundSize: "300px 300px",
                  backgroundPosition: \`-\${pieceCol * 100}px -\${pieceRow * 100}px\`,
                  backgroundRepeat: "no-repeat",
                  cursor: "pointer",
                  backgroundColor: backgroundColor,
                  transition: "all 0.2s ease",
                  position: "relative"
                }}
                onMouseOver={(e) => {
                  if (!isSelected) {
                    e.target.style.transform = "scale(1.02)";
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "scale(1)";
                }}
              />
            );
          })}
        </div>
      )}


    </div>
  );
};`,
  metadata: {
    difficulty: "Medium",
    description:
      "Arrange image pieces to recreate the original picture. Click pieces to swap their positions!",
    icon: "🧩",
    category: "Puzzle",
    tags: ["puzzle", "image", "logic", "brain", "click"],
    estimatedPlayTime: "5-10 minutes",
  },
};
