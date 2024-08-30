import { useEffect, useState } from 'react';
import { useScore } from '../contexts/ScoreProvider';
import { Events } from '../contexts/Events';
import switchSound from '../assets/switch.mp3';

const ScoreDisplay: React.FC = () => {
  const { score, hiscore } = useScore();
  const [fadeColor, setFadeColor] = useState<string | undefined>(undefined);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleCorrect = () => {
      setFadeColor('text-green-500');
      setTimeout(() => setFadeColor(undefined), 50);
    };

    const handleIncorrect = () => {
      setFadeColor('text-red-500');
      setTimeout(() => setFadeColor(undefined), 50);
    };

    Events.subscribe('correct', handleCorrect);
    Events.subscribe('reset', handleIncorrect);

    return () => {
      Events.unsubscribe('correct', handleCorrect);
      Events.unsubscribe('reset', handleIncorrect);
    };
  }, []);

  const playSound = (soundFile: string, volume: number) => {
    const audio = new Audio(soundFile);
    const pitch = Math.random() * 0.2 + 0.8;
    audio.volume = volume;
    audio.playbackRate = pitch;
    audio.play();
  };

  return (
    <div
      className={`relative bg-gray-800 font-bold rounded-xl w-14 h-14 flex items-center justify-center outline outline-gray-700 outline-4 shadow-lg hover:duration-0 hover:outline-gray-400 hover:bg-gray-700 cursor-pointer select-none ${
        fadeColor
          ? `${fadeColor} text-3xl`
          : 'text-white transition-all duration-300 text-2xl'
      }`}
      onMouseEnter={() => {
        playSound(switchSound, 0.04);
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {score}
      {isHovered && (
        <div className="absolute top-16 text-sm">Best: {hiscore || 0}</div>
      )}
    </div>
  );
};

export default ScoreDisplay;
