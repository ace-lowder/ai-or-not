import { FaInfo } from 'react-icons/fa';

const InfoButton: React.FC = () => {
  return (
    <div className="font-bold rounded-full w-14 h-14 flex items-center justify-center border border-gray-600 border-2 outline outline-gray-600 outline-4 shadow-lg cursor-pointer transition-all duration-300 hover:duration-0 text-gray-600 hover:text-gray-400 hover:outline-gray-400 hover:border-gray-400">
      <FaInfo size="28" />
    </div>
  );
};

export default InfoButton;
