import { useEffect } from 'react';
import { useGame } from '../contexts/GameProvider';

const ChoiceButtons: React.FC = () => {
  const { makeGuess } = useGame();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case '1':
        case 'a':
        case 'ArrowLeft':
          makeGuess(false);
          break;
        case '2':
        case 'd':
        case 'ArrowRight':
          makeGuess(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [makeGuess]);

  return (
    <div className="h-1/5 text-white flex p-4 gap-4 z-20">
      <button
        className="flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => makeGuess(false)}
      >
        AI
      </button>
      <button
        className="flex-grow bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => makeGuess(true)}
      >
        Real
      </button>
    </div>
  );
};

export default ChoiceButtons;
