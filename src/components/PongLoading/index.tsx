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
  const [paddle1, setPaddle1] = useState<Paddle>({ x: 20, y: 80, width: 10, height: 40 });
  const [paddle2, setPaddle2] = useState<Paddle>({ x: 270, y: 80, width: 10, height: 40 });
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const CANVAS_WIDTH = 300;
  const CANVAS_HEIGHT = 200;
  const BALL_SIZE = 8;
  const PADDLE_SPEED = 1.5;

  // Initialize game
  useEffect(() => {
    setGameStarted(true);
    
    // Set up completion timer
    const completionTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => clearTimeout(completionTimer);
  }, [duration, onComplete]);

  // Game animation loop
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

        // Ball collision with paddles
        if (
          (newBall.x <= paddle1.x + paddle1.width && 
           newBall.y + BALL_SIZE >= paddle1.y && 
           newBall.y <= paddle1.y + paddle1.height) ||
          (newBall.x + BALL_SIZE >= paddle2.x && 
           newBall.y + BALL_SIZE >= paddle2.y && 
           newBall.y <= paddle2.y + paddle2.height)
        ) {
          newBall.dx = -newBall.dx;
          // Add some randomness to make it more interesting
          newBall.dy += (Math.random() - 0.5) * 0.5;
        }

        // Ball out of bounds (scoring)
        if (newBall.x < 0) {
          setScore2(prev => prev + 1);
          newBall = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: -2, dy: 1.5 };
        } else if (newBall.x > CANVAS_WIDTH) {
          setScore1(prev => prev + 1);
          newBall = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 2, dy: 1.5 };
        }

        return newBall;
      });

      // Simple AI for paddle movement
      setPaddle1((prevPaddle) => {
        let newPaddle = { ...prevPaddle };
        
        // Move paddle towards ball with some lag
        if (ball.y < prevPaddle.y + prevPaddle.height / 2) {
          newPaddle.y = Math.max(0, newPaddle.y - PADDLE_SPEED);
        } else {
          newPaddle.y = Math.min(CANVAS_HEIGHT - newPaddle.height, newPaddle.y + PADDLE_SPEED);
        }
        
        return newPaddle;
      });

      setPaddle2((prevPaddle) => {
        let newPaddle = { ...prevPaddle };
        
        // Move paddle towards ball with some lag
        if (ball.y < prevPaddle.y + prevPaddle.height / 2) {
          newPaddle.y = Math.max(0, newPaddle.y - PADDLE_SPEED);
        } else {
          newPaddle.y = Math.min(CANVAS_HEIGHT - newPaddle.height, newPaddle.y + PADDLE_SPEED);
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
  }, [gameStarted, ball.y, paddle1.y, paddle2.y]);

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

    // Draw paddles
    ctx.fillStyle = "#10b981";
    ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);

    // Draw ball
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);

    // Draw scores
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    ctx.fillText(score1.toString(), CANVAS_WIDTH / 4, 30);
    ctx.fillText(score2.toString(), (3 * CANVAS_WIDTH) / 4, 30);
  }, [ball, paddle1, paddle2, score1, score2, gameStarted]);

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ 
            imageRendering: "pixelated",
            border: "2px solid #374151",
            borderRadius: "8px"
          }}
        />
        <div className="text-center mt-4">
          <p className="text-text text-lg font-display mb-2">{text}</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
