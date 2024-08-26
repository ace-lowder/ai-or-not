import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useComment } from './CommentProvider';
import { Events } from './Events';
import Dialogue from '../components/Dialogue';
import CommentCard from '../components/CommentCard';

interface GameContextType {
  started: boolean;
  disabled: boolean;
  idle: boolean;
  gameOver: boolean;
  round: { id: number; element: JSX.Element }[];
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
  const [round, setRound] = useState<{ id: number; element: JSX.Element }[]>(
    [],
  );
  const [idCounter, setIdCounter] = useState(0);

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    addDialogue('Press a button to start the round');
  }, []);

  const addDialogue = (text: string) => {
    setRound(prevElements => [
      ...prevElements,
      { id: idCounter, element: <Dialogue>{text}</Dialogue> },
    ]);
    setIdCounter(prevId => prevId + 1);
    setIdle(true);
  };

  useEffect(() => {
    if (fetchedComment) {
      setRound(prevElements => [
        ...prevElements,
        { id: idCounter, element: <CommentCard comment={fetchedComment} /> },
      ]);
      setIdCounter(prevId => prevId + 1);
    }
  }, [fetchedComment]);

  const addElement = () => {
    if (Math.random() > 0.2) {
      fetchComment();
    } else {
      addDialogue('This is a test');
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
      addDialogue('Oops, wrong answer');
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
