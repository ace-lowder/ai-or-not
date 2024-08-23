import React, { createContext, useContext } from 'react';
import { useScore } from './ScoreProvider';
import { useComment } from './CommentProvider';

interface GameContextType {
  makeGuess: (guess: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { incrementScore, resetScore } = useScore();
  const { fetchedComment, getRandomComment } = useComment();

  const makeGuess = (guess: boolean) => {
    if (fetchedComment) {
      if (fetchedComment.isReal === guess) {
        incrementScore();
      } else {
        resetScore();
      }
    }

    getRandomComment();
  };

  return (
    <GameContext.Provider value={{ makeGuess }}>
      {children}
    </GameContext.Provider>
  );
};

const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};

export { GameProvider, useGame };
