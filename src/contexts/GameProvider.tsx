import { createContext, useContext, useState } from 'react';

interface GameContextType {
  isFetching: boolean;
  setIsFetching: (isFetching: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isFetching, setIsFetching] = useState(false);

  return (
    <GameContext.Provider value={{ isFetching, setIsFetching }}>
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
