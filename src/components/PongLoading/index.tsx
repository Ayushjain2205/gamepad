"use client";

import { useState, useEffect, useRef } from "react";

interface PongLoadingProps {
  text?: string;
  onComplete?: () => void;
  duration?: number; // Duration in milliseconds
  className?: string;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function PongLoading({
  text = "Generating your game...",
  onComplete,
  duration = 4000, // 4 seconds default
  className = "",
}: PongLoadingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [ball, setBall] = useState<Ball>({ x: 150, y: 100, dx: 2, dy: 1.5 });
  const [paddle1, setPaddle1] = useState<Paddle>({
    x: 20,
    y: 80,
    width: 10,
    height: 40,
  });
  const [paddle2, setPaddle2] = useState<Paddle>({
    x: 270,
    y: 80,
    width: 10,
    height: 40,
  });
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [mouseY, setMouseY] = useState<number>(0);

  // Refs to access current paddle positions without triggering re-renders
  const paddle1Ref = useRef<Paddle>(paddle1);
  const paddle2Ref = useRef<Paddle>(paddle2);
  const ballRef = useRef<Ball>(ball);

  const CANVAS_WIDTH = 300;
  const CANVAS_HEIGHT = 200;
  const BALL_SIZE = 8;
  const PADDLE_SPEED = 2.5;

  // Touch/Mouse event handlers
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = event.clientY - rect.top;
    setMouseY(y);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = event.touches[0].clientY - rect.top;
    setMouseY(y);
  };

  // Update refs when state changes
  useEffect(() => {
    paddle1Ref.current = paddle1;
  }, [paddle1]);

  useEffect(() => {
    paddle2Ref.current = paddle2;
  }, [paddle2]);

  useEffect(() => {
    ballRef.current = ball;
  }, [ball]);

  // Initialize game
  useEffect(() => {
    setGameStarted(true);
    // Initialize mouse position to center
    setMouseY(CANVAS_HEIGHT / 2);

    // Set up completion timer
    const completionTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => clearTimeout(completionTimer);
  }, [duration, onComplete]);

  // Ball physics animation loop (independent of paddle movement)
  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const animate = () => {
      setBall((prevBall) => {
        let newBall = { ...prevBall };

        // Move ball
        newBall.x += newBall.dx;
        newBall.y += newBall.dy;

        // Ball collision with top/bottom walls
        if (newBall.y <= 0 || newBall.y >= CANVAS_HEIGHT - BALL_SIZE) {
          newBall.dy = -newBall.dy;
        }

        // Ball collision with paddles (using refs for current positions)
        const currentPaddle1 = paddle1Ref.current;
        const currentPaddle2 = paddle2Ref.current;

        if (
          (newBall.x <= currentPaddle1.x + currentPaddle1.width &&
            newBall.y + BALL_SIZE >= currentPaddle1.y &&
            newBall.y <= currentPaddle1.y + currentPaddle1.height) ||
          (newBall.x + BALL_SIZE >= currentPaddle2.x &&
            newBall.y + BALL_SIZE >= currentPaddle2.y &&
            newBall.y <= currentPaddle2.y + currentPaddle2.height)
        ) {
          newBall.dx = -newBall.dx;
          // Add some randomness and speed increase to make it more interesting
          newBall.dy += (Math.random() - 0.5) * 0.8;
          // Slightly increase ball speed after each hit
          newBall.dx *= 1.02;
          newBall.dy *= 1.02;
        }

        // Ball out of bounds (scoring)
        if (newBall.x < 0) {
          setScore2((prev) => prev + 1);
          newBall = {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            dx: -2,
            dy: (Math.random() - 0.5) * 3,
          };
        } else if (newBall.x > CANVAS_WIDTH) {
          setScore1((prev) => prev + 1);
          newBall = {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            dx: 2,
            dy: (Math.random() - 0.5) * 3,
          };
        }

        return newBall;
      });

      setPaddle2((prevPaddle) => {
        let newPaddle = { ...prevPaddle };

        // Move paddle towards ball with some lag (using ball ref)
        const currentBall = ballRef.current;
        if (currentBall.y < prevPaddle.y + prevPaddle.height / 2) {
          newPaddle.y = Math.max(0, newPaddle.y - PADDLE_SPEED);
        } else {
          newPaddle.y = Math.min(
            CANVAS_HEIGHT - newPaddle.height,
            newPaddle.y + PADDLE_SPEED
          );
        }

        return newPaddle;
      });

      animationRef.current = setTimeout(animate, 16); // ~60 FPS
    };

    animationRef.current = setTimeout(animate, 16);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [gameStarted]); // Only depend on gameStarted!

  // Separate effect for player paddle movement (only when mouseY changes)
  useEffect(() => {
    if (!gameStarted) return;

    setPaddle1((prevPaddle) => {
      let newPaddle = { ...prevPaddle };

      // Direct position control - much smoother
      const targetY = mouseY - newPaddle.height / 2;
      newPaddle.y = Math.max(
        0,
        Math.min(CANVAS_HEIGHT - newPaddle.height, targetY)
      );

      return newPaddle;
    });
  }, [mouseY, gameStarted]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameStarted) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line
    ctx.strokeStyle = "#4a4a6a";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles (player paddle in blue, AI paddle in green)
    ctx.fillStyle = "#3b82f6"; // Blue for player
    ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    ctx.fillStyle = "#10b981"; // Green for AI
    ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);

    // Draw ball with subtle glow
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 4;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
    ctx.shadowBlur = 0; // Reset shadow

    // Draw scores
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    ctx.fillText(score1.toString(), CANVAS_WIDTH / 4, 30);
    ctx.fillText(score2.toString(), (3 * CANVAS_WIDTH) / 4, 30);
  }, [ball, paddle1, paddle2, score1, score2, gameStarted, mouseY]);

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${className}`}
    >
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            imageRendering: "pixelated",
            border: "2px solid #374151",
            borderRadius: "8px",
            touchAction: "none", // Prevent scrolling on touch
          }}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
        />
        <div className="text-center mt-4">
          <p className="text-text text-lg font-display mb-2">{text}</p>
          <div className="text-sm text-gray-400 mb-3">
            <p>Touch and drag to move your paddle</p>
            <p className="text-xs mt-1">
              Score: <span className="text-blue-400">You {score1}</span> -{" "}
              <span className="text-green-400">AI {score2}</span>
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <div
              className="w-2 h-2 bg-accent rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-accent rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
