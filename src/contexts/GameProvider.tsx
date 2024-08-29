import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useComment } from './CommentProvider';
import { Events } from './Events';
import Dialogue from '../components/Dialogue';
import CommentCard from '../components/CommentCard';
import correctSound from '../assets/correct.wav';
import incorrectSound from '../assets/incorrect.wav';
import wooshSound from '../assets/woosh.mp3';
import logo from '../assets/logo.png';

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
    addLogo();
    addDialogue('Press a button to start the round');
  }, []);

  const addLogo = () => {
    setRound(prevElements => [
      ...prevElements,
      { id: -1, element: <img className="w-full h-auto" src={logo} /> },
    ]);
  };

  const addDialogue = (text: string) => {
    setRound(prevElements => [
      ...prevElements,
      { id: idCounter, element: <Dialogue>{text}</Dialogue> },
    ]);
    setIdCounter(prevId => prevId + 1);
    setIdle(true);
    playSound(wooshSound, 0.05);
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

  const playSound = (soundFile: string, volume: number) => {
    const audio = new Audio(soundFile);
    const pitch = Math.random() * 0.2 + 0.8;
    audio.volume = volume;
    audio.playbackRate = pitch;
    audio.play();
  };

  const addElement = () => {
    const lastFiveElements = round.slice(-5);
    const hasDialogue = lastFiveElements.some(
      element => element.element.type === Dialogue,
    );
    if (!hasDialogue) {
      addDialogue('This is a test');
      return;
    }

    if (Math.random() > 0.2) {
      playSound(wooshSound, 0.05);
      fetchComment();
    } else {
      addDialogue('This is a test');
    }
  };

  const checkGuess = (guess: boolean) => {
    if (!fetchedComment) return;

    if (fetchedComment.isReal === guess) {
      Events.emit('correct');
      playSound(correctSound, 0.1);
      addElement();
    } else {
      Events.emit('incorrect');
      playSound(incorrectSound, 0.07);
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
      playSound(wooshSound, 0.05);
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
