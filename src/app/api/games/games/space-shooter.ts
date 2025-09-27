import { GameDefinition } from "../types";

export const spaceShooterGame: GameDefinition = {
  id: "space-shooter",
  name: "Space Shooter",
  code: `const SpaceShooter = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [playerX, setPlayerX] = useState(250);
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [keys, setKeys] = useState({});
  const [isShooting, setIsShooting] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const scoreRef = useRef(0);
  const gameRef = useRef(null);
  
  const PLAYER_SPEED = 5;
  const BULLET_SPEED = 8;
  const ENEMY_SPEED = 2;
  const ENEMY_SPAWN_RATE = 0.02;
  
  // Initialize game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    scoreRef.current = 0;
    setLives(3);
    setPlayerX(250);
    setBullets([]);
    setEnemies([]);
    setKeys({});
    setIsShooting(false);
    setTouchStartX(null);
  };
  
  
  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const gameLoop = setInterval(() => {
      // Move player with touch sliding (handled in touch events)
      
      // Shoot with joystick button
      if (isShooting) {
        setBullets(prev => [...prev, { x: playerX + 25, y: 390, id: Date.now() }]);
      }
      
      // Move bullets
      setBullets(prev => prev
        .map(bullet => ({ ...bullet, y: bullet.y - BULLET_SPEED }))
        .filter(bullet => bullet.y > -10)
      );
      
      // Spawn enemies
      if (Math.random() < ENEMY_SPAWN_RATE) {
        setEnemies(prev => [...prev, { 
          x: Math.random() * 460, 
          y: -30, 
          id: Date.now() + Math.random() 
        }]);
      }
      
      // Move enemies
      setEnemies(prev => prev
        .map(enemy => ({ ...enemy, y: enemy.y + ENEMY_SPEED }))
        .filter(enemy => enemy.y < 600)
      );
      
      // Check bullet-enemy collisions
      setBullets(prevBullets => {
        setEnemies(prevEnemies => {
          const newEnemies = [];
          const newBullets = [];
          
          for (let enemy of prevEnemies) {
            let hit = false;
            for (let bullet of prevBullets) {
              if (Math.abs(bullet.x - enemy.x) < 30 && Math.abs(bullet.y - enemy.y) < 30) {
                hit = true;
                setScore(prev => {
                  const newScore = prev + 10;
                  scoreRef.current = newScore;
                  return newScore;
                });
                break;
              }
            }
            if (!hit) {
              newEnemies.push(enemy);
            }
          }
          
          for (let bullet of prevBullets) {
            let hit = false;
            for (let enemy of prevEnemies) {
              if (Math.abs(bullet.x - enemy.x) < 30 && Math.abs(bullet.y - enemy.y) < 30) {
                hit = true;
                break;
              }
            }
            if (!hit) {
              newBullets.push(bullet);
            }
          }
          
          return newEnemies;
        });
        return prevBullets.filter(bullet => {
          for (let enemy of enemies) {
            if (Math.abs(bullet.x - enemy.x) < 30 && Math.abs(bullet.y - enemy.y) < 30) {
              return false;
            }
          }
          return true;
        });
      });
      
      // Check enemy-player collisions
      setEnemies(prevEnemies => {
        const newEnemies = [];
        for (let enemy of prevEnemies) {
          if (Math.abs(enemy.x - playerX) < 50 && Math.abs(enemy.y - 440) < 50) {
            setLives(prev => prev - 1);
            if (lives <= 1) {
              setGameOver(true);
              sendScoreMessage(scoreRef.current);
            }
          } else {
            newEnemies.push(enemy);
          }
        }
        return newEnemies;
      });
      
    }, 16); // ~60 FPS
    
    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, keys, playerX, lives, enemies, bullets]);
  
  const sendScoreMessage = (score) => {
    if (window.parent) {
      window.parent.postMessage({
        type: 'GAME_SCORE',
        data: { 
          gameId: 'space-shooter',
          score: score,
          timestamp: Date.now()
        }
      }, '*');
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
  };
  
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(180deg, #000428 0%, #004e92 100%)",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      boxSizing: "border-box",
      position: "relative",
      overflow: "hidden"
    }}>
      
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "30px",
        marginBottom: "20px",
        color: "white",
        fontSize: "18px",
        fontWeight: "bold"
      }}>
        <div>💯 {score}</div>
        <div>❤️ {lives}</div>
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
          }} onClick={startGame}>
            🚀 START SHOOTER
          </div>
        </div>
      ) : gameOver ? (
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
            💥 GAME OVER
          </div>
          <div style={{
            color: "white",
            fontSize: "18px",
            marginBottom: "20px"
          }}>
            Final Score: {score}
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
      ) : (
        <div 
          ref={gameRef}
          style={{
            width: "100%",
            maxWidth: "400px",
            height: "600px",
            position: "relative",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: "15px",
            background: "linear-gradient(180deg, #0a0a2e 0%, #16213e 50%, #0f3460 100%)",
            overflow: "hidden",
            marginBottom: "20px"
          }}
        >
          {/* Player Ship - Better Design */}
          <div
            style={{
              position: "absolute",
              left: playerX + "px",
              top: "400px",
              width: "60px",
              height: "80px",
              background: "linear-gradient(180deg, #00ff88 0%, #00cc6a 50%, #009944 100%)",
              borderRadius: "30px 30px 8px 8px",
              boxShadow: "0 0 25px rgba(0, 255, 136, 0.8)",
              transform: "rotate(0deg)",
              border: "3px solid rgba(255,255,255,0.5)",
              zIndex: 10
            }}
          />
          
          {/* Ship Engine Glow */}
          <div
            style={{
              position: "absolute",
              left: playerX + 18 + "px",
              top: "460px",
              width: "24px",
              height: "20px",
              background: "linear-gradient(180deg, #ffaa00 0%, #ff6600 100%)",
              borderRadius: "12px 12px 0 0",
              opacity: "0.9",
              animation: "pulse 0.5s infinite alternate",
              boxShadow: "0 0 15px rgba(255, 170, 0, 0.8)"
            }}
          />
          
          {/* Bullets - Better Design */}
          {bullets.map(bullet => (
            <div
              key={bullet.id}
              style={{
                position: "absolute",
                left: bullet.x + "px",
                top: bullet.y + "px",
                width: "6px",
                height: "15px",
                background: "linear-gradient(180deg, #ffff00 0%, #ff8800 100%)",
                borderRadius: "3px",
                boxShadow: "0 0 10px rgba(255, 255, 0, 0.8)"
              }}
            />
          ))}
          
          {/* Enemies - Better Design */}
          {enemies.map(enemy => (
            <div
              key={enemy.id}
              style={{
                position: "absolute",
                left: enemy.x + "px",
                top: enemy.y + "px",
                width: "40px",
                height: "50px",
                background: "linear-gradient(180deg, #ff4444 0%, #cc0000 50%, #880000 100%)",
                borderRadius: "20px 20px 5px 5px",
                boxShadow: "0 0 15px rgba(255, 68, 68, 0.5)",
                border: "2px solid rgba(255,255,255,0.2)"
              }}
            />
          ))}
          
          {/* Stars background */}
          {Array.from({ length: 80 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                width: Math.random() * 3 + 1 + "px",
                height: Math.random() * 3 + 1 + "px",
                background: "white",
                borderRadius: "50%",
                animation: \`twinkle \${1 + Math.random() * 3}s infinite alternate\`,
                opacity: Math.random() * 0.8 + 0.2
              }}
            />
          ))}
        </div>
      )}
      
      {/* Simple Touch Controls - Slide to move, Hold to shoot */}
      {gameStarted && !gameOver && (
        <div 
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            touchAction: "none"
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            setTouchStartX(e.touches[0].clientX);
            setIsShooting(true);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            if (touchStartX !== null) {
              const currentX = e.touches[0].clientX;
              const deltaX = currentX - touchStartX;
              const moveAmount = deltaX * 0.5; // Sensitivity
              const newPlayerX = playerX + moveAmount;
              setPlayerX(Math.max(0, Math.min(340, newPlayerX)));
              setTouchStartX(currentX);
            }
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            setIsShooting(false);
            setTouchStartX(null);
          }}
        >
          {/* Visual indicator when shooting */}
          {isShooting && (
            <div style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(45deg, #ff4444, #cc0000)",
              border: "3px solid rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "white",
              boxShadow: "0 0 20px rgba(255, 68, 68, 0.8)",
              animation: "pulse 0.3s infinite alternate"
            }}>
              🔥
            </div>
          )}
        </div>
      )}
      
      <style jsx>{\`
        @keyframes twinkle {
          from { opacity: 0.3; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          from { opacity: 0.6; }
          to { opacity: 1; }
        }
      \`}</style>
      
    </div>
  );
};`,
  metadata: {
    difficulty: "Medium",
    description:
      "Control your spaceship and shoot down enemies. Use arrow keys to move and spacebar to shoot!",
    icon: "🚀",
    category: "Action",
    tags: ["shooter", "space", "action", "arcade", "enemies"],
    estimatedPlayTime: "5-10 minutes",
  },
};
