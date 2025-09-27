import { GameDefinition } from "../types";

// Example of how to add a new game
export const exampleGame: GameDefinition = {
  id: "example-game",
  name: "Example Game",
  code: `const ExampleGame = () => {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
  };

  const handleClick = () => {
    if (gameStarted) {
      setScore(prev => prev + 1);
    }
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "Arial, sans-serif",
      position: "relative",
      overflow: "hidden",
      touchAction: "manipulation"
    }}>
      <div style={{
        position: "absolute",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "28px",
        fontWeight: "bold",
        color: "white",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
        zIndex: 10
      }}>
        {score}
      </div>
      
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
          🎮
        </div>
      ) : (
        <div 
          onClick={handleClick}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            touchAction: "manipulation"
          }}
        >
          <div style={{
            background: "linear-gradient(45deg, #FF6B6B, #FF8E53)",
            color: "white",
            border: "none",
            padding: "40px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "32px",
            width: "150px",
            height: "150px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            userSelect: "none",
            touchAction: "manipulation"
          }}>
            TAP!
          </div>
        </div>
      )}
    </div>
  );
};`,
  metadata: {
    difficulty: "Easy",
    description: "A simple example game to demonstrate the structure",
    icon: "🎮",
    category: "Example",
    tags: ["example", "simple", "clicking"],
    estimatedPlayTime: "1-2 minutes",
  },
};
