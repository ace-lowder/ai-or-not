import { useGame } from '../contexts/GameProvider';

const ChoiceButtons: React.FC = () => {
  const { makeGuess } = useGame();

  return (
    <div className="bg-gray-800 h-32 text-white flex p-4 gap-4">
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
