import { createContext, useContext, useEffect, useState } from 'react';
import { useComment } from './CommentProvider';
import { Events } from './Events';
import Dialogue from '../components/Dialogue';
import CommentCard from '../components/CommentCard';

interface GameContextType {
  started: boolean;
  disabled: boolean;
  idle: boolean;
  gameOver: boolean;
  round: JSX.Element[];
  makeGuess: (guess: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { fetchedComment, fetchComment } = useComment();

  const [started, setStarted] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [idle, setIdle] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState<JSX.Element[]>([]);

  useEffect(() => {
    setRound([<Dialogue>Press a button to start the round</Dialogue>]);
  }, []);

  useEffect(() => {
    if (fetchedComment) {
      setRound(prevElements => [
        ...prevElements,
        <CommentCard comment={fetchedComment} />,
      ]);
    }
  }, [fetchedComment]);

  const addDialogue = () => {
    setRound(prevElements => [
      ...prevElements,
      <Dialogue>This is a test</Dialogue>,
    ]);
    setIdle(true);
  };

  const addElement = () => {
    if (Math.random() > 0.1) {
      fetchComment();
    } else {
      addDialogue();
    }
  };

  const checkGuess = (guess: boolean) => {
    if (!fetchedComment) return;

    if (fetchedComment.isReal === guess) {
      Events.emit('correct');
      addElement();
    } else {
      Events.emit('incorrect');
      setGameOver(true);
      addDialogue();
    }

    tempDisable();
  };

  const tempDisable = () => {
    setDisabled(true);
    setTimeout(() => setDisabled(false), 300);
  };

  const makeGuess = (guess: boolean) => {
    if (gameOver) {
      setGameOver(false);
      Events.emit('reset');
      setRound([]);
    }

    if (!started) {
      setStarted(true);
    }

    if (idle) {
      setIdle(false);
      tempDisable();
      fetchComment();
      return;
    }

    checkGuess(guess);
  };

  return (
    <GameContext.Provider
      value={{ started, disabled, idle, gameOver, round, makeGuess }}
    >
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
