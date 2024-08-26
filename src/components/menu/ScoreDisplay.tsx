import { useEffect, useState } from 'react';
import { useScore } from '../../contexts/ScoreProvider';
import { Events } from '../../contexts/Events';

const ScoreDisplay: React.FC = () => {
  const { score } = useScore();
  const [fadeColor, setFadeColor] = useState<string | undefined>(undefined);

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
    Events.subscribe('incorrect', handleIncorrect);

    return () => {
      Events.unsubscribe('correct', handleCorrect);
      Events.unsubscribe('incorrect', handleIncorrect);
    };
  }, []);

  return (
    <div
      className={`fixed bg-gray-800 font-bold rounded-xl w-14 h-14 top-4 left-4 z-20 flex items-center justify-center outline outline-gray-700 outline-4 shadow-2xl ${
        fadeColor
          ? `${fadeColor} text-3xl`
          : 'text-white transition-all duration-300 text-2xl'
      }`}
    >
      {score}
    </div>
  );
};

export default ScoreDisplay;
