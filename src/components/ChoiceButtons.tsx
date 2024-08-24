import { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameProvider';
import { FaRobot } from 'react-icons/fa';
import { IoPerson } from 'react-icons/io5';

const ChoiceButtons: React.FC = () => {
  const [disabled, setDisabled] = useState(false);
  const [aiPressed, setAiPressed] = useState(false);
  const [realPressed, setRealPressed] = useState(false);
  const { makeGuess } = useGame();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      console.log(disabled);
      if (disabled) return;
      switch (event.key) {
        case '1':
        case 'a':
        case 'ArrowLeft':
          handleAIClick();
          break;
        case '2':
        case 'd':
        case 'ArrowRight':
          handleRealClick();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [disabled]);

  const handleAIClick = () => {
    makeGuess(false);
    setDisabled(true);
    setAiPressed(true);

    setTimeout(() => {
      setDisabled(false);
      setAiPressed(false);
    }, 200);
  };

  const handleRealClick = () => {
    makeGuess(true);
    setDisabled(true);
    setRealPressed(true);

    setTimeout(() => {
      setDisabled(false);
      setRealPressed(false);
    }, 200);
  };

  const buttonClasses =
    'flex-grow flex flex-col items-center gap-1 text-sm text-white font-bold pt-6 px-4 rounded-2xl rounded-b-3xl border border-gray-700 border-4';

  return (
    <div className="text-white flex p-4 gap-4 z-20">
      <button
        className={`${buttonClasses} ${
          aiPressed
            ? 'bg-blue-200 pb-4 border-b-[6px] mt-2'
            : 'bg-blue-500 pb-6 border-b-[12px] transition-all duration-300'
        }`}
        onClick={handleAIClick}
        disabled={disabled}
      >
        <FaRobot className="w-10 h-10 mt-2" /> AI
      </button>
      <button
        className={`${buttonClasses} ${
          realPressed
            ? 'bg-red-200 pb-4 border-b-[6px] mt-2'
            : 'bg-red-500 pb-6 border-b-[12px] transition-all duration-300'
        }`}
        onClick={handleRealClick}
        disabled={disabled}
      >
        <IoPerson className="w-10 h-10 mt-2" /> Real
      </button>
    </div>
  );
};

export default ChoiceButtons;
