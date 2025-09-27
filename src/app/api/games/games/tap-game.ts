import { GameDefinition } from "../types";

export const tapGame: GameDefinition = {
  id: "tap-game",
  name: "Tap Game",
  code: `const TapGame = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [isPulsing, setIsPulsing] = useState(false);
  const scoreRef = useRef(0);

  const moveTarget = useCallback(() => {
    if (!gameRunning) return;
    
    const maxX = window.innerWidth - 120;
    const maxY = window.innerHeight - 120;
    
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;
    
    setTargetPosition({ x: randomX, y: randomY });
  }, [gameRunning]);

  const handleTap = useCallback((e) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    if (!gameRunning) return;
    
    setScore((prev) => {
      const newScore = prev + 1;
      scoreRef.current = newScore;
      return newScore;
    });
    
    setIsPulsing(true);
    setTimeout(() => {
      setIsPulsing(false);
    }, 500);
    
    setTimeout(() => {
      moveTarget();
    }, 100);
  }, [gameRunning, moveTarget]);

  const startGame = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(30);
    setGameOver(false);
    setGameRunning(true);
  }, []);

  useEffect(() => {
    let timer;
    if (gameRunning && timeLeft > 0) {
      if (timeLeft === 30) {
        moveTarget();
      }
      
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameRunning(false);
            setGameOver(true);
            sendScoreMessage(scoreRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameRunning, timeLeft, moveTarget]);

  const sendScoreMessage = (score) => {
    if (window.parent) {
      window.parent.postMessage({
        type: 'GAME_SCORE',
        data: { 
          gameId: 'tap-game',
          score: score,
          timestamp: Date.now()
        }
      }, '*');
    }
  };

  const resetGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(30);
    setGameRunning(false);
    setGameOver(false);
    setTargetPosition({ x: 0, y: 0 });
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "Arial, sans-serif",
      touchAction: "manipulation",
      position: "relative",
      overflow: "hidden"
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
      
      <div style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        fontSize: "24px",
        fontWeight: "bold",
        color: "white",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
        zIndex: 10
      }}>
        {timeLeft}
      </div>

      {!gameRunning && !gameOver && (
        <div 
          onClick={startGame}
          onTouchStart={startGame}
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
          🎯
        </div>
      )}

      {gameRunning && (
        <div
          onTouchStart={handleTap}
          onClick={handleTap}
          style={{
            position: "absolute",
            left: targetPosition.x,
            top: targetPosition.y,
            width: "100px",
            height: "100px",
            background: "linear-gradient(45deg, #ff6b6b, #feca57)",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            color: "white",
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            userSelect: "none",
            transition: "all 0.1s ease",
            transform: isPulsing ? "scale(1.2)" : "scale(1)",
            animation: isPulsing ? "pulse 0.5s ease-in-out" : "none",
            touchAction: "manipulation",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
          }}
        >
          👆
        </div>
      )}

      {gameOver && (
        <div 
          onClick={resetGame}
          onTouchStart={resetGame}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.9)",
            color: "white",
            padding: "40px",
            borderRadius: "20px",
            textAlign: "center",
            fontSize: "20px",
            cursor: "pointer",
            zIndex: 10
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "20px" }}>GAME OVER</div>
          <div style={{ fontSize: "24px", marginBottom: "30px" }}>Score: {score}</div>
        </div>
      )}

      <style jsx>{\`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      \`}</style>
    </div>
  );
};`,
  metadata: {
    difficulty: "Easy",
    description: "Simple timing-based tap game",
    icon: "👆",
    category: "Reaction",
    tags: ["timing", "reaction", "speed"],
    estimatedPlayTime: "30 seconds",
  },
};
