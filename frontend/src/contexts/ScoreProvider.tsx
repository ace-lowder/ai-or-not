import { createContext, useContext, useEffect, useState } from 'react';
import { Events } from './Events';

interface ScoreContextType {
  score: number;
  hiscore: number | null;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

const ScoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [score, setScore] = useState(0);
  const [hiscore, setHiscore] = useState<number | null>(null);

  useEffect(() => {
    const storedHiscore = localStorage.getItem('hiscore');
    if (storedHiscore) {
      setHiscore(parseInt(storedHiscore, 10));
    }

    const incrementScore = () => setScore(prev => prev + 1);

    const resetScore = () => setScore(0);

    const saveScore = () => {
      if (score > (hiscore || 0)) {
        setHiscore(score);
        localStorage.setItem('hiscore', score.toString());
      }
    };

    Events.subscribe('correct', incrementScore);
    Events.subscribe('gameOver', saveScore);
    Events.subscribe('reset', resetScore);

    return () => {
      Events.unsubscribe('correct', incrementScore);
      Events.unsubscribe('reset', resetScore);
    };
  }, [score, hiscore]);

  return (
    <ScoreContext.Provider value={{ score, hiscore }}>
      {children}
    </ScoreContext.Provider>
  );
};

const useScore = () => {
  const context = useContext(ScoreContext);
  if (!context) throw new Error('useScore must be used within a ScoreProvider');
  return context;
};

export { ScoreProvider, useScore };
