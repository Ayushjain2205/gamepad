import { GameDefinition } from "../types";

export const snakeGame: GameDefinition = {
  id: "snake",
  name: "Snake Game",
  code: `const SnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ dx: 0, dy: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const directionRef = useRef({ dx: 0, dy: 0 });
  const lastMoveTimeRef = useRef(0);
  const animationRef = useRef(null);

  const gridSize = 20;
  const tileCount = 20;

  const randomFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
    setFood(newFood);
  }, []);

  const moveSnake = useCallback(() => {
    if (!gameStarted || gameOver) return;
    
    const currentDirection = directionRef.current;
    if (currentDirection.dx === 0 && currentDirection.dy === 0) return;

    setSnake((prevSnake) => {
      const newSnake = [...prevSnake];
      const head = {
        x: newSnake[0].x + currentDirection.dx,
        y: newSnake[0].y + currentDirection.dy
      };

      if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        setGameOver(true);
        return prevSnake;
      }

      for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          setGameOver(true);
          return prevSnake;
        }
      }

      newSnake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => prev + 1);
        randomFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameStarted, gameOver, food, randomFood, tileCount]);

  const startGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ dx: 0, dy: 0 });
    directionRef.current = { dx: 0, dy: 0 };
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setTimeout(() => {
      randomFood();
    }, 100);
  }, [randomFood]);

  const changeDirection = (newDirection) => {
    if (!gameStarted && !gameOver) {
      startGame();
      return;
    }
    
    if (gameOver) {
      resetGame();
      return;
    }
    
    if (!gameStarted || gameOver) return;
    
    const currentDirection = directionRef.current;
    if (newDirection.dx === -currentDirection.dx && newDirection.dy === -currentDirection.dy) {
      return;
    }
    
    directionRef.current = newDirection;
    setDirection(newDirection);
  };

  const handleTouch = (e, newDirection) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    changeDirection(newDirection);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted || gameOver) return;

      switch (e.key) {
        case "ArrowUp":
          changeDirection({ dx: 0, dy: -1 });
          break;
        case "ArrowDown":
          changeDirection({ dx: 0, dy: 1 });
          break;
        case "ArrowLeft":
          changeDirection({ dx: -1, dy: 0 });
          break;
        case "ArrowRight":
          changeDirection({ dx: 1, dy: 0 });
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [gameStarted, gameOver, direction]);

  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver) return;
    
    const now = Date.now();
    if (now - lastMoveTimeRef.current >= 120) {
      moveSnake();
      lastMoveTimeRef.current = now;
    }
    
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameStarted, gameOver, moveSnake]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameStarted, gameOver, gameLoop]);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ dx: 0, dy: 0 });
    directionRef.current = { dx: 0, dy: 0 };
    lastMoveTimeRef.current = 0;
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    randomFood();
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
      fontFamily: "Arial, sans-serif",
      position: "relative",
      touchAction: "manipulation",
      overflow: "hidden"
    }}>
      <div style={{
        position: "absolute",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "28px",
        fontWeight: "bold",
        color: "#ecf0f1",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
        zIndex: 10
      }}>
        {score}
      </div>

      <div style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#2c3e50"
      }}>
        <div 
          onClick={() => {
            if (!gameStarted && !gameOver) {
              startGame();
            } else if (gameOver) {
              resetGame();
            }
          }}
          style={{
            width: "min(90vw, 90vh)",
            height: "min(90vw, 90vh)",
            background: "#2c3e50",
            position: "relative",
            display: "grid",
            gridTemplateColumns: \`repeat(\${tileCount}, 1fr)\`,
            gridTemplateRows: \`repeat(\${tileCount}, 1fr)\`,
            gap: "1px",
            cursor: (!gameStarted || gameOver) ? "pointer" : "default"
          }}>
        {snake.map((segment, index) => (
          <div
            key={index}
            style={{
              background: index === 0 ? "#2ecc71" : "#27ae60",
              borderRadius: "2px",
              gridColumn: segment.x + 1,
              gridRow: segment.y + 1
            }}
          />
        ))}

        <div
          style={{
            background: "#e74c3c",
            borderRadius: "2px",
            gridColumn: food.x + 1,
            gridRow: food.y + 1
          }}
        />
        </div>
      </div>

      <div style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        width: "100px",
        height: "100px",
        background: "rgba(0,0,0,0.7)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(10px)",
        border: "2px solid rgba(255,255,255,0.3)",
        zIndex: 10
      }}>
        <div style={{
          position: "relative",
          width: "80px",
          height: "80px"
        }}>
          <button
            onTouchStart={(e) => handleTouch(e, { dx: 0, dy: -1 })}
            onClick={() => changeDirection({ dx: 0, dy: -1 })}
            style={{
              position: "absolute",
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
              width: "25px",
              height: "25px",
              background: "rgba(52, 152, 219, 0.9)",
              border: "none",
              borderRadius: "4px",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
              touchAction: "manipulation",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ↑
          </button>
          
          <button
            onTouchStart={(e) => handleTouch(e, { dx: -1, dy: 0 })}
            onClick={() => changeDirection({ dx: -1, dy: 0 })}
            style={{
              position: "absolute",
              left: "0",
              top: "50%",
              transform: "translateY(-50%)",
              width: "25px",
              height: "25px",
              background: "rgba(52, 152, 219, 0.9)",
              border: "none",
              borderRadius: "4px",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
              touchAction: "manipulation",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ←
          </button>
          
          <button
            onTouchStart={(e) => handleTouch(e, { dx: 1, dy: 0 })}
            onClick={() => changeDirection({ dx: 1, dy: 0 })}
            style={{
              position: "absolute",
              right: "0",
              top: "50%",
              transform: "translateY(-50%)",
              width: "25px",
              height: "25px",
              background: "rgba(52, 152, 219, 0.9)",
              border: "none",
              borderRadius: "4px",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
              touchAction: "manipulation",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            →
          </button>
          
          <button
            onTouchStart={(e) => handleTouch(e, { dx: 0, dy: 1 })}
            onClick={() => changeDirection({ dx: 0, dy: 1 })}
            style={{
              position: "absolute",
              bottom: "0",
              left: "50%",
              transform: "translateX(-50%)",
              width: "25px",
              height: "25px",
              background: "rgba(52, 152, 219, 0.9)",
              border: "none",
              borderRadius: "4px",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
              touchAction: "manipulation",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ↓
          </button>
        </div>
      </div>

      {!gameStarted && !gameOver && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(0,0,0,0.9)",
          color: "#ecf0f1",
          padding: "40px",
          borderRadius: "20px",
          textAlign: "center",
          border: "2px solid #e74c3c",
          fontSize: "24px",
          fontWeight: "bold",
          zIndex: 10
        }}>
          🐍
        </div>
      )}

      {gameOver && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(0,0,0,0.9)",
          color: "#ecf0f1",
          padding: "40px",
          borderRadius: "20px",
          textAlign: "center",
          border: "2px solid #e74c3c",
          zIndex: 10
        }}>
          <div style={{ fontSize: "32px", marginBottom: "20px" }}>GAME OVER</div>
          <div style={{ fontSize: "24px", marginBottom: "30px" }}>Score: {score}</div>
        </div>
      )}
    </div>
  );
};`,
  metadata: {
    difficulty: "Medium",
    description: "Classic snake game with growing mechanics",
    icon: "🐍",
    category: "Puzzle",
    tags: ["strategy", "growing", "navigation"],
    estimatedPlayTime: "5-10 minutes",
  },
};
