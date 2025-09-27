import { GameDefinition } from "../types";

export const pixelRunnerGame: GameDefinition = {
  id: "pixel-runner",
  name: "🏃 Pixel Runner",
  code: `const PixelRunner = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [jumping, setJumping] = useState(false);
  const scoreRef = useRef(0);
  const gameStateRef = useRef({
    player: { 
      x: 80, 
      y: 200, 
      velocityY: 0, 
      velocityX: 0, // Forward momentum
      width: 24, 
      height: 32,
      onGround: false,
      animationFrame: 0,
      direction: 1 // 1 for right, -1 for left
    },
    platforms: [],
    enemies: [],
    collectibles: [],
    camera: { x: 0, y: 0 },
    level: { width: 10000, height: 400 },
    animationId: null,
    lastPlatformTime: 0,
    lastEnemyTime: 0,
    lastCollectibleTime: 0
  });

  const GRAVITY = 0.8;
  const JUMP_FORCE = -15; // Increased jump force
  const RUN_SPEED = 1.5;
  const CAMERA_OFFSET = 200;

  // Initialize platforms - simple ground track
  const initializeLevel = useCallback(() => {
    const { level } = gameStateRef.current;
    const platforms = [];
    
    // Simple ground track - mostly flat with small gaps
    const groundY = level.height - 60;
    
    // Starting platform
    platforms.push({
      x: 0,
      y: groundY,
      width: 300,
      height: 60,
      color: '#8B4513'
    });

    // Create simple track with small gaps for jumping
    let currentX = 300;
    while (currentX < level.width - 200) {
      // Very small gap (30-50 pixels) - easier to jump
      const gapSize = 30 + Math.random() * 20;
      currentX += gapSize;
      
      // Platform after gap (150-300 pixels)
      const platformSize = 150 + Math.random() * 150;
      platforms.push({
        x: currentX,
        y: groundY,
        width: platformSize,
        height: 60,
        color: '#8B4513'
      });
      
      currentX += platformSize;
    }

    // No end platform - game is endless!

    gameStateRef.current.platforms = platforms;
  }, []);

  const jump = useCallback(() => {
    if (gameStarted && !gameOver && gameStateRef.current.player.onGround) {
      gameStateRef.current.player.velocityY = JUMP_FORCE;
      gameStateRef.current.player.velocityX = RUN_SPEED * 2; // Stronger forward momentum boost
      gameStateRef.current.player.onGround = false;
      setJumping(true);
    } else if (gameOver) {
      resetGame();
    }
  }, [gameStarted, gameOver]);

  const handleTapAnywhere = useCallback((e) => {
    if (gameOver) {
      e.preventDefault();
      resetGame();
    }
  }, [gameOver]);

  const handleJump = (e) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    e.stopPropagation();
    jump();
  };

  const drawPixelArt = useCallback((ctx, x, y, pixelSize = 4) => {
    // Save context
    ctx.save();
    
    // Enable pixelated rendering
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    
    // Scale context for pixel art
    ctx.scale(pixelSize, pixelSize);
    
    return { x: x / pixelSize, y: y / pixelSize };
  }, []);

  const drawPlayer = useCallback((ctx, player, camera) => {
    const pixelSize = 4;
    const { x: px, y: py } = drawPixelArt(ctx, player.x - camera.x, player.y - camera.y, pixelSize);
    
    // Player sprite (pixel art style)
    const w = player.width / pixelSize;
    const h = player.height / pixelSize;
    
    // Body (blue)
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(px, py + 2, w, h - 4);
    
    // Head (skin color)
    ctx.fillStyle = '#FDBCB4';
    ctx.fillRect(px + 2, py, w - 4, 4);
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(px + 3, py + 1, 1, 1);
    ctx.fillRect(px + w - 4, py + 1, 1, 1);
    
    // Hair (brown)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(px + 1, py - 1, w - 2, 2);
    
    // Arms (skin color)
    ctx.fillStyle = '#FDBCB4';
    ctx.fillRect(px - 1, py + 3, 2, 6);
    ctx.fillRect(px + w - 1, py + 3, 2, 6);
    
    // Legs (blue pants)
    ctx.fillStyle = '#000080';
    ctx.fillRect(px + 1, py + h - 2, 3, 2);
    ctx.fillRect(px + w - 4, py + h - 2, 3, 2);
    
    // Feet (black shoes)
    ctx.fillStyle = '#000';
    ctx.fillRect(px, py + h, 4, 1);
    ctx.fillRect(px + w - 4, py + h, 4, 1);
    
    // Running animation
    if (player.onGround && gameStarted && !gameOver) {
      const legOffset = Math.sin(player.animationFrame * 0.3) * 1;
      ctx.fillRect(px + 1, py + h - 2 + legOffset, 3, 2);
      ctx.fillRect(px + w - 4, py + h - 2 - legOffset, 3, 2);
    }
    
    ctx.restore();
  }, [drawPixelArt]);

  const drawPlatform = useCallback((ctx, platform, camera) => {
    const pixelSize = 4;
    const { x: px, y: py } = drawPixelArt(ctx, platform.x - camera.x, platform.y - camera.y, pixelSize);
    const w = platform.width / pixelSize;
    const h = platform.height / pixelSize;
    
    // Platform base
    ctx.fillStyle = platform.color;
    ctx.fillRect(px, py, w, h);
    
    // Platform border
    ctx.fillStyle = '#654321';
    ctx.fillRect(px, py, w, 1);
    ctx.fillRect(px, py + h - 1, w, 1);
    ctx.fillRect(px, py, 1, h);
    ctx.fillRect(px + w - 1, py, 1, h);
    
    ctx.restore();
  }, [drawPixelArt]);

  const drawEnemy = useCallback((ctx, enemy, camera) => {
    const pixelSize = 4;
    const { x: px, y: py } = drawPixelArt(ctx, enemy.x - camera.x, enemy.y - camera.y, pixelSize);
    const w = enemy.width / pixelSize;
    const h = enemy.height / pixelSize;
    
    // Enemy body (red)
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(px, py, w, h);
    
    // Enemy eyes (white with black pupils)
    ctx.fillStyle = '#FFF';
    ctx.fillRect(px + 1, py + 1, 2, 1);
    ctx.fillRect(px + w - 3, py + 1, 2, 1);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(px + 2, py + 1, 1, 1);
    ctx.fillRect(px + w - 2, py + 1, 1, 1);
    
    // Enemy spikes
    ctx.fillStyle = '#8B0000';
    for (let i = 0; i < w; i += 2) {
      ctx.fillRect(px + i, py - 1, 1, 2);
    }
    
    ctx.restore();
  }, [drawPixelArt]);

  const drawCollectible = useCallback((ctx, collectible, camera) => {
    const pixelSize = 4;
    const { x: px, y: py } = drawPixelArt(ctx, collectible.x - camera.x, collectible.y - camera.y, pixelSize);
    const w = collectible.width / pixelSize;
    const h = collectible.height / pixelSize;
    
    // Coin/gem (golden)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(px, py, w, h);
    
    // Inner highlight
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(px + 1, py + 1, w - 2, h - 2);
    
    // Sparkle effect
    ctx.fillStyle = '#FFF';
    ctx.fillRect(px + w/2, py, 1, 1);
    ctx.fillRect(px, py + h/2, 1, 1);
    ctx.fillRect(px + w - 1, py + h/2, 1, 1);
    ctx.fillRect(px + w/2, py + h - 1, 1, 1);
    
    ctx.restore();
  }, [drawPixelArt]);

  const drawGame = useCallback((ctx) => {
    const canvas = canvasRef.current;
    const { player, platforms, enemies, collectibles, camera } = gameStateRef.current;
    
    // Set canvas dimensions for mobile
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    // Clear with sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw clouds (pixel art style)
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 5; i++) {
      const cloudX = (i * 200 - camera.x * 0.3) % (canvas.width + 100);
      const cloudY = 50 + i * 30;
      const pixelSize = 6;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.scale(pixelSize, pixelSize);
      
      // Simple cloud shape
      ctx.fillRect(cloudX / pixelSize, cloudY / pixelSize, 8, 3);
      ctx.fillRect((cloudX + 2) / pixelSize, (cloudY - 2) / pixelSize, 6, 3);
      ctx.fillRect((cloudX + 4) / pixelSize, (cloudY - 1) / pixelSize, 4, 3);
      
      ctx.restore();
    }
    
    // Draw platforms
    platforms.forEach(platform => {
      if (platform.x + platform.width > camera.x - 100 && platform.x < camera.x + canvas.width + 100) {
        drawPlatform(ctx, platform, camera);
      }
    });
    
    // Draw enemies
    enemies.forEach(enemy => {
      if (enemy.x + enemy.width > camera.x - 100 && enemy.x < camera.x + canvas.width + 100) {
        drawEnemy(ctx, enemy, camera);
      }
    });
    
    // Draw collectibles
    collectibles.forEach(collectible => {
      if (collectible.x + collectible.width > camera.x - 100 && collectible.x < camera.x + canvas.width + 100) {
        drawCollectible(ctx, collectible, camera);
      }
    });
    
    // Draw player
    drawPlayer(ctx, player, camera);
  }, [drawPlayer, drawPlatform, drawEnemy, drawCollectible]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const { player, platforms, enemies, collectibles, camera, level } = gameStateRef.current;

    if (!gameStarted || gameOver) {
      gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
      return;
    }

    // Update player physics
    player.velocityY += GRAVITY;
    player.y += player.velocityY;
    player.animationFrame += 1;
    
    // Player movement - use velocityX for smooth movement
    if (gameStarted && !gameOver) {
      // Apply forward momentum
      if (player.velocityX > 0) {
        player.x += player.velocityX;
        player.velocityX *= 0.98; // Gradual slowdown
      }
      // Base running speed
      player.x += RUN_SPEED;
    }

    // Check platform collisions
    player.onGround = false;
    platforms.forEach(platform => {
      if (player.x < platform.x + platform.width &&
          player.x + player.width > platform.x &&
          player.y < platform.y + platform.height &&
          player.y + player.height > platform.y) {
        
        if (player.velocityY > 0 && player.y < platform.y) {
          player.y = platform.y - player.height;
          player.velocityY = 0;
          player.onGround = true;
          setJumping(false);
        }
      }
    });

    // Move camera to follow player (mobile optimized)
    const canvasWidth = canvas.offsetWidth || canvas.width / (window.devicePixelRatio || 1);
    camera.x = Math.max(0, player.x - CAMERA_OFFSET);
    camera.x = Math.min(camera.x, level.width - canvasWidth);

    // Check if player fell off the world
    if (player.y > level.height) {
      setGameOver(true);
      sendScoreMessage(scoreRef.current);
      return;
    }

    // Simple scoring - just based on distance traveled
    if (player.x > score * 10) {
      const newScore = Math.floor(player.x / 10);
      setScore(newScore);
      scoreRef.current = newScore;
    }

    // Generate new platforms as player progresses (endless)
    const lastPlatform = platforms[platforms.length - 1];
    
    if (lastPlatform && player.x > lastPlatform.x - 1000) {
      // Add new platform ahead
      const newPlatformX = lastPlatform.x + lastPlatform.width + (30 + Math.random() * 20);
      const platformSize = 150 + Math.random() * 150;
      
      platforms.push({
        x: newPlatformX,
        y: level.height - 60,
        width: platformSize,
        height: 60,
        color: '#8B4513'
      });
    }

    drawGame(ctx);
    gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
  }, [gameStarted, gameOver, drawGame]);

  useEffect(() => {
    initializeLevel();
    
    if (gameStarted && !gameOver) {
      gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
    }
    
    // Handle mobile orientation changes and resize
    const handleResize = () => {
      // Force canvas redraw on resize
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawGame(ctx);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      if (gameStateRef.current.animationId) {
        cancelAnimationFrame(gameStateRef.current.animationId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [gameStarted, gameOver, gameLoop, initializeLevel, drawGame]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  // Auto-start the game
  useEffect(() => {
    if (!gameStarted) {
      setGameStarted(true);
    }
  }, [gameStarted]);

  const sendScoreMessage = (score) => {
    if (window.parent) {
      window.parent.postMessage({
        type: 'GAME_SCORE',
        data: { 
          gameId: 'pixel-runner',
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
    setJumping(false);
    gameStateRef.current = {
      player: { 
        x: 80, 
        y: 200, 
        velocityY: 0, 
        velocityX: 0, // Forward momentum
        width: 24, 
        height: 32,
        onGround: false,
        animationFrame: 0,
        direction: 1
      },
      platforms: [],
      enemies: [],
      collectibles: [],
      camera: { x: 0, y: 0 },
      level: { width: 10000, height: 400 },
      animationId: null,
      lastPlatformTime: 0,
      lastEnemyTime: 0,
      lastCollectibleTime: 0
    };
    initializeLevel();
  };

  return (
    <div 
      onClick={handleTapAnywhere}
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(to bottom, #87CEEB 0%, #98FB98 100%)",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
        WebkitUserSelect: "none",
        KhtmlUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        cursor: gameOver ? "pointer" : "default"
      }}>
      {/* Score Display */}
      <div style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        fontSize: "24px",
        fontWeight: "bold",
        color: "white",
        textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
        zIndex: 10,
        background: "rgba(0,0,0,0.6)",
        padding: "10px 15px",
        borderRadius: "10px"
      }}>
        Score: {score}
      </div>

      {/* Jump Button */}
      <div style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            jump();
          }}
          disabled={!gameStarted || gameOver}
          style={{
            width: "80px",
            height: "80px",
            fontSize: "24px",
            border: "none",
            borderRadius: "50%",
            background: gameStarted && !gameOver ? "#4CAF50" : "#666",
            color: "white",
            cursor: gameStarted && !gameOver ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            fontWeight: "bold",
            transition: "all 0.2s ease",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none"
          }}
        >
          JUMP
        </button>
      </div>


      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          border: "none",
          outline: "none",
          background: "transparent",
          imageRendering: "pixelated",
          userSelect: "none",
          WebkitUserSelect: "none",
          KhtmlUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none"
        }}
      />


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
          <div style={{ fontSize: "32px", marginBottom: "20px" }}>💀 GAME OVER 💀</div>
          <div style={{ fontSize: "24px", marginBottom: "20px" }}>Final Score: {score}</div>
          <div style={{ fontSize: "16px", opacity: 0.8 }}>
            Tap to restart
          </div>
        </div>
      )}
    </div>
  );
};`,
  metadata: {
    difficulty: "Medium",
    description:
      "2D pixel art platform runner with jumping, enemies, and collectibles",
    icon: "🏃‍♂️",
    category: "Platform",
    tags: [
      "2d",
      "platform",
      "runner",
      "pixel-art",
      "jumping",
      "enemies",
      "collectibles",
      "procedural",
    ],
    estimatedPlayTime: "5-10 minutes",
  },
};
