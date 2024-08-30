import { useEffect, useState } from 'react';
import { useScore } from '../contexts/ScoreProvider';
import { Events } from '../contexts/Events';

const ScoreDisplay: React.FC = () => {
  const { score, hiscore } = useScore();
  const [fadeColor, setFadeColor] = useState<string | undefined>(undefined);
  const [isHovered, setIsHovered] = useState(false); // State to track hover

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

  return (
    <div
      className={`relative bg-gray-800 font-bold rounded-xl w-14 h-14 flex items-center justify-center outline outline-gray-700 outline-4 shadow-lg hover:duration-0 hover:outline-gray-400 hover:bg-gray-700 cursor-pointer select-none ${
        fadeColor
          ? `${fadeColor} text-3xl`
          : 'text-white transition-all duration-300 text-2xl'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {score}
      {/* High score box, shown on hover */}
      {isHovered && (
        <div className="absolute top-16 text-sm">Best: {hiscore || 0}</div>
      )}
    </div>
  );
};

export default ScoreDisplay;
