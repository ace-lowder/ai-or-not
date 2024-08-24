import { useScore } from '../contexts/ScoreProvider';

const ScoreDisplay: React.FC = () => {
  const { score } = useScore();

  return (
    <div className="bg-gray-800 text-white text-2xl font-bold rounded-xl w-14 h-14 m-4 relative z-20 flex items-center justify-center">
      {score}
    </div>
  );
};

export default ScoreDisplay;
