import { GameDefinition } from "../types";

export const flappyBirdGame: GameDefinition = {
  id: "flappy-bird",
  name: "Flappy Bird",
  code: `const FlappyBird = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const scoreRef = useRef(0);
  const gameStateRef = useRef({
    bird: { x: 80, y: 10, velocity: 0 },
    pipes: [],
    animationId: null
  });

  const GRAVITY = 0.2;
  const JUMP = -4;
  const PIPE_WIDTH = 50;
  const PIPE_GAP = 150;
  const PIPE_SPEED = 1;

  const jump = useCallback(() => {
    if (gameStarted && !gameOver) {
      gameStateRef.current.bird.velocity = JUMP;
    } else if (!gameStarted) {
      setGameStarted(true);
    } else if (gameOver) {
      resetGame();
    }
  }, [gameStarted, gameOver]);

  const handleJump = (e) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    jump();
  };

  const drawGame = useCallback((ctx) => {
    const { bird, pipes } = gameStateRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match the container
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw bird
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(bird.x, bird.y, 30, 30);
    
    // Bird details
    ctx.fillStyle = "#000";
    ctx.fillRect(bird.x + 18, bird.y + 6, 5, 5);
    ctx.fillRect(bird.x + 6, bird.y + 15, 10, 5);
    
    // Draw pipes
    ctx.fillStyle = "#228B22";
    pipes.forEach((pipe) => {
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, canvas.height - pipe.bottomY);
    });
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { bird, pipes } = gameStateRef.current;

    // Ensure canvas dimensions are set
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    if (!gameStarted || gameOver) {
      gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
      return;
    }

    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    if (bird.y + 30 >= canvas.height) {
      setGameOver(true);
      // Send final score when bird hits ground
      sendScoreMessage(scoreRef.current);
      return;
    }

    if (bird.velocity < 0 && bird.y <= 0) {
      bird.y = 0;
      bird.velocity = 0;
    }

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
      const topHeight = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
      pipes.push({
        x: canvas.width,
        topHeight,
        bottomY: topHeight + PIPE_GAP
      });
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].x -= PIPE_SPEED;
      
      if (pipes[i].x + PIPE_WIDTH < 0) {
        pipes.splice(i, 1);
        setScore((prev) => {
          const newScore = prev + 1;
          scoreRef.current = newScore;
          return newScore;
        });
      }
    }

    pipes.forEach((pipe) => {
      if (bird.x < pipe.x + PIPE_WIDTH && bird.x + 30 > pipe.x) {
      if (bird.y < pipe.topHeight || bird.y + 30 > pipe.bottomY) {
        setGameOver(true);
        // Send final score when game ends
        sendScoreMessage(scoreRef.current);
        return;
      }
      }
    });

    drawGame(ctx);
    gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
  }, [gameStarted, gameOver, drawGame]);

  useEffect(() => {
    // Initialize canvas dimensions
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    
    if (gameStarted && !gameOver) {
      gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameStateRef.current.animationId) {
        cancelAnimationFrame(gameStateRef.current.animationId);
      }
    };
  }, [gameStarted, gameOver, gameLoop]);

  const sendScoreMessage = (score) => {
    if (window.parent) {
      window.parent.postMessage({
        type: 'GAME_SCORE',
        data: { 
          gameId: 'flappy-bird',
          score: score,
          timestamp: Date.now()
        }
      }, '*');
    }
  };

  const resetGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setGameStarted(false);
    gameStateRef.current.bird = { x: 80, y: 10, velocity: 0 };
    gameStateRef.current.pipes = [];
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(to bottom, #87CEEB 0%, #98FB98 100%)",
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
        color: "white",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
        zIndex: 10
      }}>
        {score}
      </div>

      <canvas
        ref={canvasRef}
        onTouchStart={handleJump}
        onClick={handleJump}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: "pointer",
          touchAction: "manipulation",
          userSelect: "none",
          border: "none",
          outline: "none",
          background: "transparent"
        }}
      />

      {!gameStarted && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "30px",
          borderRadius: "15px",
          textAlign: "center",
          zIndex: 10,
          fontSize: "24px",
          fontWeight: "bold"
        }}>
          🐦
        </div>
      )}

      {gameOver && (
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
          zIndex: 10,
          fontSize: "20px"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "20px" }}>GAME OVER</div>
          <div style={{ fontSize: "24px", marginBottom: "30px" }}>Score: {score}</div>
        </div>
      )}
    </div>
  );
};`,
  metadata: {
    difficulty: "Easy",
    description: "Classic endless flying game with obstacles",
    icon: "🐦",
    category: "Arcade",
    tags: ["endless", "timing", "obstacles"],
    estimatedPlayTime: "2-5 minutes",
  },
};
