"use client";

import { useState, useEffect, useRef } from "react";

interface SnakeLoadingProps {
  text?: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

interface Position {
  x: number;
  y: number;
}

export default function SnakeLoading({
  text = "Loading...",
  size = "medium",
  className = "",
}: SnakeLoadingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [snake, setSnake] = useState<Position[]>([]);
  const [currentDirection, setCurrentDirection] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: { canvasSize: 100, cellSize: 8, speed: 150 },
    medium: { canvasSize: 140, cellSize: 12, speed: 120 },
    large: { canvasSize: 180, cellSize: 16, speed: 100 },
  };

  const config = sizeConfig[size];

  // Square track directions: right, down, left, up
  const directions = [
    { x: 1, y: 0 }, // right
    { x: 0, y: 1 }, // down
    { x: -1, y: 0 }, // left
    { x: 0, y: -1 }, // up
  ];

  // Initialize snake in a square track
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gridSize = Math.floor(config.canvasSize / config.cellSize);
    const margin = 1; // Minimal margin
    const trackSize = gridSize - margin * 2;

    // Create snake segments along the top edge
    const initialSnake: Position[] = [];
    for (let i = 0; i < Math.min(6, trackSize); i++) {
      initialSnake.push({ x: margin + i, y: margin });
    }

    setSnake(initialSnake);
    setGameStarted(true);
  }, [config.canvasSize, config.cellSize]);

  // Animation loop
  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gridSize = Math.floor(config.canvasSize / config.cellSize);
    const margin = 1;
    const trackSize = gridSize - margin * 2;

    const animate = () => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };
        const direction = directions[currentDirection];

        // Move head
        head.x += direction.x;
        head.y += direction.y;

        // Check if we need to change direction (hit a corner)
        const shouldChangeDirection =
          (currentDirection === 0 && head.x >= margin + trackSize - 1) || // right edge
          (currentDirection === 1 && head.y >= margin + trackSize - 1) || // bottom edge
          (currentDirection === 2 && head.x <= margin) || // left edge
          (currentDirection === 3 && head.y <= margin); // top edge

        if (shouldChangeDirection) {
          setCurrentDirection((prev) => (prev + 1) % 4);
        }

        newSnake.unshift(head);

        // Keep snake at a fixed length
        if (newSnake.length > 6) {
          newSnake.pop();
        }

        return newSnake;
      });

      animationRef.current = setTimeout(animate, config.speed);
    };

    animationRef.current = setTimeout(animate, config.speed);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [
    gameStarted,
    currentDirection,
    config.speed,
    config.canvasSize,
    config.cellSize,
  ]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameStarted) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, config.canvasSize, config.canvasSize);

    // Draw snake
    snake.forEach((segment, index) => {
      const alpha = Math.max(0.4, 1 - index * 0.15); // Fade effect
      ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`; // Green with alpha
      ctx.fillRect(
        segment.x * config.cellSize,
        segment.y * config.cellSize,
        config.cellSize - 1,
        config.cellSize - 1
      );
    });
  }, [snake, gameStarted, config.canvasSize, config.cellSize]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={config.canvasSize}
        height={config.canvasSize}
        style={{ imageRendering: "pixelated" }}
      />
      <p className="text-text text-sm font-display mt-3">{text}</p>
    </div>
  );
}
