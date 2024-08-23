import { useScore } from '../contexts/ScoreProvider';

const ScoreDisplay: React.FC = () => {
  const { score } = useScore();

  return (
    <div className="fixed flex items-center justify-center top-0 left-0 bg-gray-800 text-white text-3xl font-bold rounded-xl py-4 px-8 m-4">
      Score: {score}
    </div>
  );
};

export default ScoreDisplay;
