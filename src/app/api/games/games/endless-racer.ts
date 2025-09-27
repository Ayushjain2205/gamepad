import { GameDefinition } from "../types";

export const endlessRacerGame: GameDefinition = {
  id: "endless-racer",
  name: "3D Endless Racer",
  code: `const EndlessRacer = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const scoreRef = useRef(0);
  const [speed, setSpeed] = useState(2);
  const [touchStart, setTouchStart] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(2);
  const gameStateRef = useRef({
    car: { x: 0, lane: 1, targetLane: 1, laneChangeSpeed: 0.05, mesh: null },
    road: { position: 0, meshes: [] },
    obstacles: [],
    animationId: null,
    lastObstacleTime: 0,
    playerSpeed: 2
  });

  const LANES = 3;
  const LANE_WIDTH = 4;
  const CAR_WIDTH = 1.5;
  const CAR_HEIGHT = 3;
  const OBSTACLE_WIDTH = 1.5; // Bigger obstacles
  const OBSTACLE_HEIGHT = 2.5; // Taller obstacles
  const ROAD_SPEED = 0.3;
  const LANE_CHANGE_SPEED = 0.15;

  // Button controls for lane changing and speed
  const handleLaneChange = (direction) => {
    if (!gameStarted || gameOver) return;
    
    const { car } = gameStateRef.current;
    
    if (direction === 'left' && car.lane > 0) {
      car.targetLane = car.lane - 1;
    } else if (direction === 'right' && car.lane < LANES - 1) {
      car.targetLane = car.lane + 1;
    }
  };

  const handleSpeedChange = (direction) => {
    if (!gameStarted || gameOver) return;
    
    const currentPlayerSpeed = gameStateRef.current.playerSpeed;
    
    if (direction === 'up' && currentPlayerSpeed < 6) {
      gameStateRef.current.playerSpeed = Math.min(currentPlayerSpeed + 0.5, 6);
      setCurrentSpeed(gameStateRef.current.playerSpeed);
    } else if (direction === 'down' && currentPlayerSpeed > 1) {
      gameStateRef.current.playerSpeed = Math.max(currentPlayerSpeed - 0.5, 1);
      setCurrentSpeed(gameStateRef.current.playerSpeed);
    }
  };

  const initThreeJS = useCallback(() => {
    if (!canvasRef.current) return;

    // Check if Three.js is already loaded
    if (window.THREE) {
      const THREE = window.THREE;
      setupThreeScene(THREE);
      return;
    }

    // Load Three.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
      const THREE = window.THREE;
      setupThreeScene(THREE);
    };
    script.onerror = () => {
      console.error('Failed to load Three.js');
    };
    document.head.appendChild(script);
  }, []);

  const setupThreeScene = (THREE) => {
      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x87CEEB);
      sceneRef.current = scene;

      // Camera setup
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 12, 10);
      camera.lookAt(0, 0, -20); // Look at a reasonable distance
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current, 
        antialias: true,
        alpha: true 
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 20, 10);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      // Create road
      createRoad(THREE);
      
      // Create car
      createCar(THREE);
    };

  const createRoad = (THREE) => {
    const scene = sceneRef.current;
    
    // Road surface - darker asphalt
    const roadGeometry = new THREE.PlaneGeometry(14, 1000);
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    scene.add(road);
    gameStateRef.current.road.meshes.push(road);

    // Lane dividers - thick white lines
    for (let i = 0; i < 200; i++) {
      const lineGeometry = new THREE.PlaneGeometry(0.3, 4);
      const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(-LANE_WIDTH, 0.02, -i * 5);
      scene.add(line);
      gameStateRef.current.road.meshes.push(line);
      
      // Right lane divider
      const rightLine = new THREE.Mesh(lineGeometry, lineMaterial);
      rightLine.rotation.x = -Math.PI / 2;
      rightLine.position.set(LANE_WIDTH, 0.02, -i * 5);
      scene.add(rightLine);
      gameStateRef.current.road.meshes.push(rightLine);
    }

    // Road edges - thick yellow lines
    const edgeGeometry = new THREE.PlaneGeometry(0.4, 1000);
    const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
    
    const leftEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    leftEdge.rotation.x = -Math.PI / 2;
    leftEdge.position.set(-7, 0.03, 0);
    scene.add(leftEdge);
    gameStateRef.current.road.meshes.push(leftEdge);

    const rightEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    rightEdge.rotation.x = -Math.PI / 2;
    rightEdge.position.set(7, 0.03, 0);
    scene.add(rightEdge);
    gameStateRef.current.road.meshes.push(rightEdge);

    // Lane markers - visible lane indicators
    for (let i = 0; i < 50; i++) {
      // Left lane marker
      const leftMarkerGeometry = new THREE.PlaneGeometry(0.1, 8);
      const leftMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
      const leftMarker = new THREE.Mesh(leftMarkerGeometry, leftMarkerMaterial);
      leftMarker.rotation.x = -Math.PI / 2;
      leftMarker.position.set(-LANE_WIDTH, 0.01, -i * 20);
      scene.add(leftMarker);
      gameStateRef.current.road.meshes.push(leftMarker);

      // Right lane marker
      const rightMarkerGeometry = new THREE.PlaneGeometry(0.1, 8);
      const rightMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
      const rightMarker = new THREE.Mesh(rightMarkerGeometry, rightMarkerMaterial);
      rightMarker.rotation.x = -Math.PI / 2;
      rightMarker.position.set(LANE_WIDTH, 0.01, -i * 20);
      scene.add(rightMarker);
      gameStateRef.current.road.meshes.push(rightMarker);
    }
  };

  const createCar = (THREE) => {
    const scene = sceneRef.current;
    
    // Car body - brighter red with better proportions
    const carGeometry = new THREE.BoxGeometry(CAR_WIDTH, CAR_HEIGHT * 0.5, CAR_HEIGHT * 0.8);
    const carMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
    const car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.set(0, CAR_HEIGHT * 0.25, 0);
    car.castShadow = true;
    scene.add(car);
    gameStateRef.current.car.mesh = car;

    // Car roof - darker red
    const roofGeometry = new THREE.BoxGeometry(CAR_WIDTH * 0.9, CAR_HEIGHT * 0.4, CAR_HEIGHT * 0.7);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xCC0000 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, CAR_HEIGHT * 0.7, 0);
    roof.castShadow = true;
    car.add(roof);

    // Windshield
    const windshieldGeometry = new THREE.BoxGeometry(CAR_WIDTH * 0.8, CAR_HEIGHT * 0.2, CAR_HEIGHT * 0.1);
    const windshieldMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.7 });
    const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
    windshield.position.set(0, CAR_HEIGHT * 0.8, CAR_HEIGHT * 0.3);
    car.add(windshield);

    // Wheels - larger and more visible
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.25, 12);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const rimMaterial = new THREE.MeshLambertMaterial({ color: 0xCCCCCC });
    
    const wheelPositions = [
      [-CAR_WIDTH * 0.7, -CAR_HEIGHT * 0.1, CAR_HEIGHT * 0.35],
      [CAR_WIDTH * 0.7, -CAR_HEIGHT * 0.1, CAR_HEIGHT * 0.35],
      [-CAR_WIDTH * 0.7, -CAR_HEIGHT * 0.1, -CAR_HEIGHT * 0.35],
      [CAR_WIDTH * 0.7, -CAR_HEIGHT * 0.1, -CAR_HEIGHT * 0.35]
    ];

    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheel.castShadow = true;
      car.add(wheel);

      // Wheel rims
      const rimGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 12);
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.rotation.z = Math.PI / 2;
      rim.position.set(pos[0], pos[1], pos[2]);
      car.add(rim);
    });

    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFAA });
    
    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-CAR_WIDTH * 0.4, CAR_HEIGHT * 0.3, CAR_HEIGHT * 0.4);
    car.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(CAR_WIDTH * 0.4, CAR_HEIGHT * 0.3, CAR_HEIGHT * 0.4);
    car.add(rightHeadlight);
  };

  const createObstacle = (THREE) => {
    const scene = sceneRef.current;
    if (!scene) {
      console.log('No scene available for obstacle creation');
      return;
    }
    
    try {
      // Random lane
      const lane = Math.floor(Math.random() * LANES);
      const x = (lane - 1) * LANE_WIDTH;
      
      // Simple obstacle - just a big red box for now
      const obstacleGeometry = new THREE.BoxGeometry(OBSTACLE_WIDTH, OBSTACLE_HEIGHT, OBSTACLE_HEIGHT);
      const obstacleMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 }); // Bright red
      const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
      obstacle.position.set(x, OBSTACLE_HEIGHT / 2, -80); // Spawn far back
      obstacle.castShadow = true;
      obstacle.receiveShadow = true;
      
      scene.add(obstacle);
      
      const obstacleData = {
        mesh: obstacle,
        lane,
        id: Date.now(),
        spawnTime: Date.now()
      };
      
      gameStateRef.current.obstacles.push(obstacleData);
      console.log('Created obstacle at lane', lane, 'position', x, 'total obstacles:', gameStateRef.current.obstacles.length);
      
    } catch (error) {
      console.error('Error creating obstacle:', error);
    }
  };

  const gameLoop = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !window.THREE) return;

    if (!gameStarted || gameOver) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
      return;
    }
    
    // Debug: Log obstacle count every 60 frames (about once per second)
    if (Date.now() % 1000 < 16) { // Roughly once per second
      console.log('Game loop: obstacles count =', gameStateRef.current.obstacles.length);
    }

    const { car, road, obstacles } = gameStateRef.current;

    // Update car position (smooth lane changing)
    if (car.lane !== car.targetLane) {
      const targetX = (car.targetLane - 1) * LANE_WIDTH; // Target position for the lane
      car.x += (targetX - car.x) * LANE_CHANGE_SPEED;
      
      if (Math.abs(targetX - car.x) < 0.1) {
        car.lane = car.targetLane;
        car.x = targetX; // Keep the car at the target position
      }
    }

    if (car.mesh) {
      car.mesh.position.x = car.x;
    }

    // Update road position using player-controlled speed
    const effectiveSpeed = ROAD_SPEED + gameStateRef.current.playerSpeed * 0.1;
    road.position += effectiveSpeed;
    road.meshes.forEach(mesh => {
      mesh.position.z += effectiveSpeed;
      if (mesh.position.z > 100) {
        mesh.position.z -= 200;
      }
    });

    // Spawn obstacles - simplified and more reliable
    const currentTime = Date.now();
    const spawnInterval = 2500; // Fixed interval, no speed dependency for now
    if (currentTime - gameStateRef.current.lastObstacleTime > spawnInterval) {
      if (window.THREE && sceneRef.current) {
        createObstacle(window.THREE);
        console.log('Obstacle spawned, total obstacles:', gameStateRef.current.obstacles.length + 1);
      }
      gameStateRef.current.lastObstacleTime = currentTime;
    }

    // Update obstacles - simplified logic
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i];
      
      if (!obstacle || !obstacle.mesh) {
        console.log('Removing invalid obstacle at index', i);
        obstacles.splice(i, 1);
        continue;
      }
      
      // Move obstacle forward
      obstacle.mesh.position.z += effectiveSpeed;
      
      // Remove only when clearly behind the car
      if (obstacle.mesh.position.z > 15) {
        console.log('Removing obstacle at z =', obstacle.mesh.position.z);
        sceneRef.current.remove(obstacle.mesh);
        obstacles.splice(i, 1);
        setScore(prev => {
          const newScore = prev + 10;
          scoreRef.current = newScore;
          return newScore;
        });
      }
    }

    // Collision detection - use actual mesh positions
    const carX = car.x;
    const carZ = 0;
    
    for (const obstacle of obstacles) {
      const obstacleX = obstacle.mesh.position.x; // Use actual mesh position
      const obstacleZ = obstacle.mesh.position.z;
      
      // Check if obstacle is close to car in both X and Z
      const distanceX = Math.abs(carX - obstacleX);
      const distanceZ = Math.abs(carZ - obstacleZ);
      
      if (distanceX < (CAR_WIDTH + OBSTACLE_WIDTH) / 2 && distanceZ < (CAR_HEIGHT + OBSTACLE_HEIGHT) / 2) {
        setGameOver(true);
        sendScoreMessage(scoreRef.current);
        return;
      }
    }

    // Increase speed over time
    if (score > 0 && score % 100 === 0) {
      setSpeed(prev => Math.min(prev + 0.2, 8));
    }

    // Render the scene
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
  }, [gameStarted, gameOver, score, speed]);

  useEffect(() => {
    initThreeJS();
    
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    
    if (gameStarted && !gameOver) {
      gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameStateRef.current.animationId) {
        cancelAnimationFrame(gameStateRef.current.animationId);
      }
    };
  }, [gameStarted, gameOver, gameLoop, initThreeJS]);

  const startGame = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
    } else if (gameOver) {
      resetGame();
    }
  }, [gameStarted, gameOver]);

  const sendScoreMessage = (score) => {
    if (window.parent) {
      window.parent.postMessage({
        type: 'GAME_SCORE',
        data: { 
          gameId: 'endless-racer',
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
    setSpeed(2);
    setCurrentSpeed(2);
    gameStateRef.current = {
      car: { x: 0, lane: 1, targetLane: 1, laneChangeSpeed: 0.05, mesh: null },
      road: { position: 0, meshes: [] },
      obstacles: [],
      animationId: null,
      lastObstacleTime: Date.now() - 5000, // Start spawning obstacles immediately
      playerSpeed: 2
    };
    
    // Reinitialize scene
    if (sceneRef.current && rendererRef.current) {
      // Clear scene
      while(sceneRef.current.children.length > 0) {
        sceneRef.current.remove(sceneRef.current.children[0]);
      }
      initThreeJS();
    }
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(to bottom, #87CEEB 0%, #228B22 100%)",
      fontFamily: "Arial, sans-serif",
      position: "relative",
      touchAction: "manipulation",
      overflow: "hidden"
    }}>
      {/* Score and Speed Display */}
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
        <div>Score: {score}</div>
        <div>Speed: {currentSpeed.toFixed(1)}</div>
      </div>

      <canvas
        ref={canvasRef}
        onClick={startGame}
        style={{
          width: "100%",
          height: "calc(100% - 60px)", // Leave space for compact buttons
          display: "block",
          cursor: "pointer",
          touchAction: "manipulation",
          userSelect: "none",
          border: "none",
          outline: "none",
          background: "transparent"
        }}
      />

      {/* Compact Arrow Button Controls */}
      <div style={{
        position: "absolute",
        bottom: "0",
        left: "0",
        right: "0",
        height: "60px",
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "15px",
        padding: "10px"
      }}>
        <button
          onClick={() => handleLaneChange('left')}
          disabled={!gameStarted || gameOver}
          style={{
            width: "50px",
            height: "50px",
            fontSize: "24px",
            border: "none",
            borderRadius: "8px",
            background: "#4444ff",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
          }}
        >
          ⬅
        </button>
        
        <button
          onClick={() => handleSpeedChange('down')}
          disabled={!gameStarted || gameOver || currentSpeed <= 1}
          style={{
            width: "50px",
            height: "50px",
            fontSize: "24px",
            border: "none",
            borderRadius: "8px",
            background: currentSpeed <= 1 ? "#666" : "#ff4444",
            color: "white",
            cursor: currentSpeed <= 1 ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
          }}
        >
          ⬇
        </button>
        
        <button
          onClick={() => handleSpeedChange('up')}
          disabled={!gameStarted || gameOver || currentSpeed >= 6}
          style={{
            width: "50px",
            height: "50px",
            fontSize: "24px",
            border: "none",
            borderRadius: "8px",
            background: currentSpeed >= 6 ? "#666" : "#44ff44",
            color: "white",
            cursor: currentSpeed >= 6 ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
          }}
        >
          ⬆
        </button>
        
        <button
          onClick={() => handleLaneChange('right')}
          disabled={!gameStarted || gameOver}
          style={{
            width: "50px",
            height: "50px",
            fontSize: "24px",
            border: "none",
            borderRadius: "8px",
            background: "#4444ff",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
          }}
        >
          ➡
        </button>
      </div>

      {!gameStarted && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "40px",
          borderRadius: "20px",
          textAlign: "center",
          zIndex: 10,
          fontSize: "24px",
          fontWeight: "bold"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>🏎️</div>
          <div style={{ marginBottom: "20px" }}>3D Endless Racer</div>
          <div style={{ fontSize: "18px", marginBottom: "30px", opacity: 0.8 }}>
            Use arrow buttons to control speed and lanes
          </div>
          <div style={{ fontSize: "16px", opacity: 0.7 }}>
            Tap to start!
          </div>
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
          <div style={{ fontSize: "32px", marginBottom: "20px" }}>💥 CRASH! 💥</div>
          <div style={{ fontSize: "24px", marginBottom: "20px" }}>Score: {score}</div>
          <div style={{ fontSize: "18px", marginBottom: "30px" }}>Final Speed: {currentSpeed.toFixed(1)}</div>
          <div style={{ fontSize: "16px", opacity: 0.8 }}>
            Tap to restart!
          </div>
        </div>
      )}
    </div>
  );
};`,
  metadata: {
    difficulty: "Medium",
    description:
      "Real 3D endless racing game with arrow button controls and speed management",
    icon: "🏎️",
    category: "Racing",
    tags: [
      "3d",
      "racing",
      "endless",
      "obstacles",
      "mobile",
      "threejs",
      "buttons",
      "speed",
    ],
    estimatedPlayTime: "5-10 minutes",
  },
};
