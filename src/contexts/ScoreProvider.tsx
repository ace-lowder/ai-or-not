import { createContext, useContext, useEffect, useState } from 'react';
import { Events } from './Events';

interface ScoreContextType {
  score: number;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

const ScoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const incrementScore = () => setScore(prev => prev + 1);
    const resetScore = () => setScore(0);

    Events.subscribe('correct', incrementScore);
    Events.subscribe('incorrect', resetScore);

    return () => {
      Events.unsubscribe('correct', incrementScore);
      Events.unsubscribe('incorrect', resetScore);
    };
  }, []);

  return (
    <ScoreContext.Provider value={{ score }}>{children}</ScoreContext.Provider>
  );
};

const useScore = () => {
  const context = useContext(ScoreContext);
  if (!context) throw new Error('useScore must be used within a ScoreProvider');
  return context;
};

export { ScoreProvider, useScore };
