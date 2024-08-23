import { createContext, useContext, useState } from "react";

interface ScoreContextType {
  score: number;
  incrementScore: () => void;
  resetScore: () => void;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

const ScoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [score, setScore] = useState(0);

  const incrementScore = () => setScore((prevScore) => prevScore + 1);
  const resetScore = () => setScore(0);

  return (
    <ScoreContext.Provider value={{ score, incrementScore, resetScore }}>
      {children}
    </ScoreContext.Provider>
  );
};

const useScore = () => {
  const context = useContext(ScoreContext);
  if (!context) throw new Error("useScore must be used within a ScoreProvider");
  return context;
};

export { ScoreProvider, useScore };
