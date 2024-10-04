import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../contexts/GameProvider';
import { FaRobot, FaPlay, FaArrowRight, FaSync } from 'react-icons/fa';
import { IoPerson } from 'react-icons/io5';
import buttonClick from '../assets/click.mp3';

interface GuessButtonProps {
  type: 'ai' | 'real' | 'start' | 'continue' | 'restart';
}

const GuessButton: React.FC<GuessButtonProps> = ({ type }) => {
  const { disabled, gameOver, started, idle, makeGuess } = useGame();
  const [pressed, setPressed] = useState(false);

  const iconMap = {
    ai: <FaRobot className="w-10 h-10 mt-2" />,
    real: <IoPerson className="w-10 h-10 mt-2" />,
    start: <FaPlay className="w-10 h-10 mt-2" />,
    continue: <FaArrowRight className="w-10 h-10 mt-2" />,
    restart: <FaSync className="w-10 h-10 mt-2" />,
  };

  const textMap = {
    ai: 'AI',
    real: 'Real',
    start: 'Start',
    continue: 'Continue',
    restart: 'Restart',
  };

  const bgColorMap = {
    ai: pressed ? 'bg-blue-200' : 'bg-blue-500',
    real: pressed ? 'bg-red-200' : 'bg-red-500',
    start: pressed ? 'bg-green-200' : 'bg-green-500',
    continue: pressed ? 'bg-green-200' : 'bg-green-500',
    restart: pressed ? 'bg-red-200' : 'bg-red-500',
  };

  const playSound = (soundFile: string, volume: number) => {
    const audio = new Audio(soundFile);
    const pitch = Math.random() * 0.2 + 0.8;
    audio.volume = volume;
    audio.playbackRate = pitch;
    audio.play();
  };

  const handlePressAnimation = useCallback(() => {
    setPressed(true);
    setTimeout(() => setPressed(false), 100);
  }, []);

  const handleClick = useCallback(() => {
    makeGuess(type === 'real');
    handlePressAnimation();
    playSound(buttonClick, 0.4);
  }, [type, makeGuess, handlePressAnimation]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (disabled) return;

      const isAI = type === 'ai';
      const isReal = type === 'real';

      const aiKeys = ['1', 'a', 'ArrowLeft'];
      const realKeys = ['2', 'd', 'ArrowRight'];
      const aiKeyPressed = aiKeys.includes(event.key);
      const realKeyPressed = realKeys.includes(event.key);
      const anyKeyPressed = aiKeyPressed || realKeyPressed;

      if (isAI && aiKeys.includes(event.key)) {
        handleClick();
      } else if (isReal && realKeyPressed) {
        handleClick();
      } else if (type !== 'ai' && type !== 'real' && anyKeyPressed) {
        handleClick();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [type, disabled, gameOver, started, idle, handleClick]);

  return (
    <button
      className={`relative flex-grow flex flex-col items-center gap-1 text-sm text-white font-bold pt-6 px-4 rounded-2xl rounded-b-3xl border border-gray-700 border-4 ${
        pressed
          ? `${bgColorMap[type]} pb-4 border-b-[6px] mt-2`
          : `${bgColorMap[type]} pb-6 border-b-[12px] transition-all duration-300`
      }`}
      onClick={handleClick}
      disabled={disabled}
    >
      {iconMap[type]} {textMap[type]}
      {type === 'ai' && (
        <div className="hidden md:block absolute top-2 left-2 px-1.5 py-0.5 text-xs font-bold text-blue-800 bg-blue-200 rounded-md opacity-50">
          A
        </div>
      )}
      {type === 'real' && (
        <div className="hidden md:block absolute top-2 right-2 px-1.5 py-0.5 text-xs font-bold text-red-800 bg-red-200 rounded-md opacity-50">
          D
        </div>
      )}
    </button>
  );
};

export default GuessButton;
