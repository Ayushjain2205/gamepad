import { GameDefinition } from "../types";

export const memoryMatchGame: GameDefinition = {
  id: "memory-match",
  name: "Memory Match",
  code: `const MemoryMatch = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timeTaken, setTimeTaken] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const scoreRef = useRef(0);

  // Card symbols for matching
  const symbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎵', '🎸', '🎺', '🎻', '🎹', '🎤', '🎧'];
  
  // Initialize game with shuffled cards
  const initializeGame = () => {
    const gameSymbols = symbols.slice(0, 8); // Use 8 symbols for 16 cards
    const cardPairs = [...gameSymbols, ...gameSymbols]; // Create pairs
    const shuffledCards = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setTimeLeft(60);
    setTimeTaken(0);
    setScore(0);
    setGameStarted(true);
    setGameCompleted(false);
  };

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameCompleted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
        setTimeTaken(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameCompleted(true);
      sendScoreMessage(scoreRef.current);
    }
  }, [gameStarted, gameCompleted, timeLeft]);

  // Handle card click
  const handleCardClick = (cardId) => {
    if (flippedCards.length >= 2 || gameCompleted) return;
    
    const card = cards.find(c => c.id === cardId);
    if (card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard.symbol === secondCard.symbol) {
        // Match found! Update cards to mark them as matched
        setCards(prevCards => 
          prevCards.map(card => 
            card.id === firstId || card.id === secondId
              ? { ...card, isMatched: true }
              : card
          )
        );
        setMatchedCards(prev => [...prev, firstId, secondId]);
        setScore(prev => {
          const newScore = prev + 10;
          scoreRef.current = newScore;
          return newScore;
        });
        setFlippedCards([]); // Clear flipped cards immediately for matched pair
        
        // Check if game is completed
        setTimeout(() => {
          setCards(prevCards => {
            const newMatchedCount = prevCards.filter(c => c.isMatched).length;
            if (newMatchedCount === cards.length) {
              setGameCompleted(true);
              sendScoreMessage(scoreRef.current);
            }
            return prevCards;
          });
        }, 100);
      } else {
        // No match, flip cards back after delay
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const sendScoreMessage = (score) => {
    if (window.parent) {
      window.parent.postMessage({
        type: 'GAME_SCORE',
        data: { 
          gameId: 'memory-match',
          score: score,
          timestamp: Date.now()
        }
      }, '*');
    }
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "Arial, sans-serif",
      position: "relative",
      overflow: "hidden",
      touchAction: "manipulation",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      boxSizing: "border-box"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: "600px",
        marginBottom: "20px",
        color: "white",
        fontSize: "24px",
        fontWeight: "bold",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
      }}>
        <div>⏱️ {timeLeft}</div>
        <div>💯 {score}</div>
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
          }} onClick={initializeGame}>
            🧠 START
          </div>
        </div>
      ) : gameCompleted ? (
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
            {timeLeft === 0 ? "TIME UP!" : "COMPLETE!"}
          </div>
          <div style={{
            color: "white",
            fontSize: "18px",
            marginBottom: "20px"
          }}>
            Time: {timeTaken}s | Score: {score}
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
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
              transition: "transform 0.2s"
            }}
            onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.target.style.transform = "scale(1)"}
          >
            PLAY AGAIN
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          maxWidth: "600px",
          width: "100%"
        }}>
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              style={{
                aspectRatio: "1",
                background: flippedCards.includes(card.id) || card.isMatched
                  ? "linear-gradient(45deg, #FF6B6B, #FF8E53)"
                  : "linear-gradient(45deg, #4ECDC4, #44A08D)",
                borderRadius: "15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                cursor: card.isMatched ? "default" : "pointer",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                transition: "all 0.3s ease",
                transform: flippedCards.includes(card.id) || card.isMatched ? "scale(1.05)" : "scale(1)",
                userSelect: "none",
                touchAction: "manipulation",
                opacity: card.isMatched ? 0.7 : 1
              }}
              onMouseOver={(e) => {
                if (!flippedCards.includes(card.id) && !card.isMatched) {
                  e.target.style.transform = "scale(1.05)";
                }
              }}
              onMouseOut={(e) => {
                if (!flippedCards.includes(card.id) && !card.isMatched) {
                  e.target.style.transform = "scale(1)";
                }
              }}
            >
              {flippedCards.includes(card.id) || card.isMatched ? card.symbol : "?"}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};`,
  metadata: {
    difficulty: "Medium",
    description:
      "Test your memory by matching pairs of cards. Find all pairs to win!",
    icon: "🧠",
    category: "Puzzle",
    tags: ["memory", "matching", "puzzle", "cards", "brain"],
    estimatedPlayTime: "3-5 minutes",
  },
};
