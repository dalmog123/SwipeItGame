// Importing necessary React features
import { useState, useEffect, useCallback } from 'react';
// Importing icons from lucide-react
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Circle, CircleDot, X } from 'lucide-react';
// Importing your custom components
import Header from './components/Header';
import GameOver from './components/GameOver';
import Block from './components/Block';
// Defining the game actions
const actions = [
  { type: 'swipeLeft', icon: ArrowLeft, color: '#FF6B6B' },
  { type: 'swipeRight', icon: ArrowRight, color: '#4ECDC4' },
  { type: 'swipeUp', icon: ArrowUp, color: '#45B7D1' },
  { type: 'swipeDown', icon: ArrowDown, color: '#96CEB4' },
  { type: 'tap', icon: Circle, color: '#FFBE0B' },
  { type: 'doubleTap', icon: CircleDot, color: '#FF006E' },
  { type: 'avoid', icon: X, color: '#000000' }
];

// Tutorial blocks
const tutorialBlocks = [
  { type: 'tap', icon: Circle, color: '#FFBE0B' },
  { type: 'swipeLeft', icon: ArrowLeft, color: '#FF6B6B' },
  { type: 'doubleTap', icon: CircleDot, color: '#FF006E' }
];


export default function SwipeGame() {
  const [gameState, setGameState] = useState({
    blocks: [],
    score: 0,
    timer: 0,
    isGameOver: false,
    isInTutorial: true,
    tutorialIndex: 0,
    transitioning: false
  });

  const [interactionState, setInteractionState] = useState({
    start: null,
    lastTapTime: 0,
    tapCount: 0
  });

  const resetGame = useCallback(() => {
    setGameState({
      blocks: [],
      score: 0,
      timer: 0,
      isGameOver: false,
      isInTutorial: true,
      tutorialIndex: 0,
      transitioning: false
    });
    setInteractionState({
      start: null,
      lastTapTime: 0,
      tapCount: 0
    });
  }, []);

  const getRandomBlock = useCallback(() => ({
    ...actions[Math.floor(Math.random() * actions.length)],
    id: Math.random().toString(36).substr(2, 9),
    createdAt: Date.now()
  }), []);

  const spawnBlocks = useCallback(() => {
    const { blocks, score, isGameOver, isInTutorial, tutorialIndex, transitioning } = gameState;

    if (isGameOver || transitioning) return;

    if (blocks.length === 0) {
      if (isInTutorial) {
        const tutorialBlock = {
          ...tutorialBlocks[tutorialIndex],
          id: `tutorial-${tutorialIndex}`,
          createdAt: Date.now()
        };
        setGameState(prev => ({ ...prev, blocks: [tutorialBlock] }));
      } else {
        const targetBlockCount = Math.min(9, 1 + Math.floor(score / 50));
        const newBlocks = Array(targetBlockCount)
          .fill(null)
          .map(() => getRandomBlock());
        setGameState(prev => ({ ...prev, blocks: newBlocks }));
      }
    }
  }, [gameState, getRandomBlock]);

  useEffect(() => {
    spawnBlocks();
  }, [spawnBlocks, gameState.blocks.length]);

  useEffect(() => {
    if (gameState.isGameOver || gameState.isInTutorial) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        const updatedTimer = prev.timer + 0.1;
        const timeLimit = prev.score >= 500 ? 5 : 5.5;

        // Check if any regular blocks have timed out
        const shouldGameOver = prev.blocks.some(block =>
          block.type !== 'avoid' &&
          (Date.now() - block.createdAt) / 1000 >= timeLimit
        );

        if (shouldGameOver) {
          return { ...prev, isGameOver: true };
        }

        // Handle expired avoid blocks and other updates
        const currentTime = Date.now();
        const expiredAvoidBlocks = prev.blocks.filter(block =>
          block.type === 'avoid' &&
          (currentTime - block.createdAt) / 1000 >= timeLimit
        ).length;

        const updatedBlocks = prev.blocks.filter(block =>
          block.type !== 'avoid' ||
          (currentTime - block.createdAt) / 1000 < timeLimit
        );

        return {
          ...prev,
          timer: updatedTimer,
          blocks: updatedBlocks,
          score: prev.score + (expiredAvoidBlocks * 10)
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.isGameOver, gameState.isInTutorial]);

  const handleSuccess = useCallback((blockId) => {
    setGameState(prev => {
      if (prev.isInTutorial) {
        if (prev.tutorialIndex < tutorialBlocks.length - 1) {
          return {
            ...prev,
            blocks: [],
            tutorialIndex: prev.tutorialIndex + 1,
            transitioning: true
          };
        } else {
          return {
            ...prev,
            blocks: [],
            isInTutorial: false,
            transitioning: true
          };
        }
      } else {
        return {
          ...prev,
          score: prev.score + 10,
          blocks: prev.blocks.filter(b => b.id !== blockId)
        };
      }
    });

    if (gameState.isInTutorial) {
      setTimeout(() => {
        setGameState(prev => ({ ...prev, transitioning: false }));
      }, 100);
    }
  }, [gameState.isInTutorial]);

  const handleInteraction = useCallback((e, type, block) => {
    e.preventDefault();
    if (gameState.isGameOver) return;
    const point = e.touches?.[0] || e.changedTouches?.[0] || e;

    if (type === 'start') {
      setInteractionState(prev => ({
        ...prev,
        start: {
          x: point.clientX,
          y: point.clientY,
          time: Date.now()
        }
      }));
    } else if (type === 'end') {
      const start = interactionState.start;
      if (!start) return;
      
      const deltaX = point.clientX - start.x;
      const deltaY = point.clientY - start.y;
      const deltaTime = Date.now() - start.time;
      
      if (block.type === 'avoid') {
        setGameState(prev => ({ ...prev, isGameOver: true }));
        return;
      }
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        const now = Date.now();
        
        if (block.type === 'doubleTap') {
          if (now - interactionState.lastTapTime < 300) {
            handleSuccess(block.id);
            setInteractionState(prev => ({
              ...prev,
              lastTapTime: 0,
              tapCount: 0
            }));
          } else {
            setInteractionState(prev => ({
              ...prev,
              lastTapTime: now,
              tapCount: prev.tapCount + 1
            }));
          }
        } else if (block.type === 'tap') {
          handleSuccess(block.id);
        }
      } else if (deltaTime < 250) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > absY && absX > 30) {
          if ((deltaX > 0 && block.type === 'swipeRight') ||
            (deltaX < 0 && block.type === 'swipeLeft')) {
            handleSuccess(block.id);
          }
        } else if (absY > absX && absY > 30) {
          if ((deltaY > 0 && block.type === 'swipeDown') ||
            (deltaY < 0 && block.type === 'swipeUp')) {
            handleSuccess(block.id);
          }
        }
      }

      setInteractionState(prev => ({ ...prev, start: null }));
    }
  }, [gameState.isGameOver, interactionState.start, interactionState.lastTapTime, handleSuccess]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 touch-none select-none">
      <Header score={gameState.score} timer={gameState.timer} isInTutorial={gameState.isInTutorial} />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 pt-4">
        {gameState.isGameOver ? (
          <GameOver score={gameState.score} resetGame={resetGame} />
        ) : (
          gameState.blocks.map((block) => (
            <Block
              key={block.id}
              block={block}
              gameState={gameState}
              handleInteraction={handleInteraction}
            />
          ))
        )}
      </div>

      {!gameState.isGameOver && gameState.isInTutorial && gameState.blocks[0] && (
        <div className="fixed bottom-8 text-gray-600">
          {gameState.blocks[0].type === 'doubleTap' ? 'Double Tap' :
            gameState.blocks[0].type === 'tap' ? 'Tap' :
              `Swipe ${gameState.blocks[0].type.replace('swipe', '')}`}
        </div>
      )}
    </div>

  );
}
