import { createContext, useContext } from 'react';
import { useComment } from './CommentProvider';
import { Events } from './Events';

interface GameContextType {
  makeGuess: (guess: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { fetchedComment, getRandomComment } = useComment();

  const makeGuess = (guess: boolean) => {
    if (fetchedComment) {
      if (fetchedComment.isReal === guess) {
        Events.emit('correct');
      } else {
        Events.emit('incorrect');
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
