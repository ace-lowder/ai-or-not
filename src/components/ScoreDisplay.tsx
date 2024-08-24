import { useScore } from '../contexts/ScoreProvider';

const ScoreDisplay: React.FC = () => {
  const { score } = useScore();

  return (
    <div className="bg-gray-800 text-white text-xl font-bold rounded-xl py-3 px-4 m-4 relative z-20">
      Score: {score}
    </div>
  );
};

export default ScoreDisplay;
