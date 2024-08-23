const ChoiceButtons: React.FC = () => {
  return (
    <div className="bg-gray-800 h-32 text-white flex p-4 gap-4">
      <button className="flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        AI
      </button>
      <button className="flex-grow bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        Real
      </button>
    </div>
  );
};

export default ChoiceButtons;
