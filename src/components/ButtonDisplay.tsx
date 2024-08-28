import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameProvider';
import GuessButton from './GuessButton';

const ButtonDisplay: React.FC = () => {
  const { started, idle, gameOver } = useGame();
  const [visibleState, setVisibleState] = useState<
    'start' | 'idle' | 'gameOver' | 'guess'
  >('start');

  useEffect(() => {
    let newState: 'start' | 'idle' | 'gameOver' | 'guess' = 'guess';

    if (!started) {
      newState = 'start';
    } else if (gameOver) {
      newState = 'gameOver';
    } else if (idle) {
      newState = 'idle';
    } else {
      newState = 'guess';
    }

    const timeout = setTimeout(() => {
      setVisibleState(newState);
    }, 300);

    return () => clearTimeout(timeout);
  }, [started, idle, gameOver]);

  return (
    <div className="w-full text-white flex p-4 gap-4 z-20">
      {visibleState === 'start' && <GuessButton type="start" />}
      {visibleState === 'gameOver' && <GuessButton type="restart" />}
      {visibleState === 'idle' && <GuessButton type="continue" />}
      {visibleState === 'guess' && (
        <>
          <GuessButton type="ai" />
          <GuessButton type="real" />
        </>
      )}
    </div>
  );
};

export default ButtonDisplay;
