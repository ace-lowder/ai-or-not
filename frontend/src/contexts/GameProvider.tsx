import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useComment } from './CommentProvider';
import { useScore } from './ScoreProvider';
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
  lives: number;
  gameOver: boolean;
  lastGuessCorrect: boolean | null;
  round: { id: number; element: JSX.Element }[];
  makeGuess: (guess: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { fetchedComment, fetchComment } = useComment();
  const { score } = useScore();

  const [started, setStarted] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [idle, setIdle] = useState(true);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [lastGuessCorrect, setLastGuessCorrect] = useState<boolean | null>(
    null,
  );
  const [round, setRound] = useState<{ id: number; element: JSX.Element }[]>(
    [],
  );
  const [idCounter, setIdCounter] = useState(0);

  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    addLogo();
    addDialogue();

    console.log(
      'This web app was made by Ace Lowder\n\nConnect with me on LinkedIn!\nhttps://www.linkedin.com/in/ace-lowder/\n\n########## Thanks for playing ##########',
    );
  }, []);

  const addLogo = () => {
    setRound(prevElements => [
      ...prevElements,
      {
        id: Math.random(),
        element: <img className="w-full h-auto" src={logo} />,
      },
    ]);
  };

  const addGameOver = () => {
    setRound(prevElements => [
      ...prevElements,
      {
        id: Math.random(),
        element: (
          <div className="flex flex-col gap-2 w-full items-center justify-center">
            <h1 className="w-full text-center text-4xl text-white font-bold">
              Game Over
            </h1>
            <p className="w-full text-center text-xl text-white font-semibold">
              Final Score: {score}
            </p>
          </div>
        ),
      },
    ]);
  };

  const addDialogue = () => {
    setRound(prevElements => [
      ...prevElements,
      { id: idCounter, element: <Dialogue /> },
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
      addDialogue();
      return;
    }

    if (Math.random() > 0.2) {
      playSound(wooshSound, 0.05);
      fetchComment();
    } else {
      addDialogue();
    }
  };

  const checkGuess = (guess: boolean) => {
    if (!fetchedComment) return;

    if (fetchedComment.isReal === guess) {
      setLastGuessCorrect(true);
      Events.emit('correct');
      playSound(correctSound, 0.1);
      addElement();
    } else {
      setLastGuessCorrect(false);
      Events.emit('incorrect');
      playSound(incorrectSound, 0.07);
      setLives(prevLives => prevLives - 1);

      if (lives - 1 <= 0) {
        Events.emit('gameOver');
        setGameOver(true);
        addDialogue();
        addGameOver();
        return;
      }

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
      setStarted(false);
      Events.emit('reset');
      setLives(3);
      setRound([]);
      addLogo();
      addDialogue();
      return;
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
      value={{
        started,
        disabled,
        idle,
        lives,
        gameOver,
        lastGuessCorrect,
        round,
        makeGuess,
      }}
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
