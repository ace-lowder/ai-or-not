import { createContext, useContext, useEffect, useState } from 'react';
import { useComment } from './CommentProvider';
import { Events } from './Events';
import Dialogue from '../components/display/Dialogue';
import CommentCard from '../components/display/CommentCard';

interface GameContextType {
  started: boolean;
  disabled: boolean;
  idle: boolean;
  round: JSX.Element[];
  makeGuess: (guess: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { fetchedComment, fetchComment } = useComment();

  const [started, setStarted] = useState(true);
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
    if (Math.random() > 0.5) {
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
    console.log('Disabling for 200ms');
    setDisabled(true);
    setTimeout(() => setDisabled(false), 200);
  };

  const makeGuess = (guess: boolean) => {
    if (gameOver) {
      setGameOver(false);
      setRound([]);
    }

    if (!started) {
      setStarted(true);
      fetchComment();
      return;
    }

    if (idle) {
      setIdle(false);
      fetchComment();
      return;
    }

    checkGuess(guess);
  };

  console.log(round);

  return (
    <GameContext.Provider value={{ started, disabled, idle, round, makeGuess }}>
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
