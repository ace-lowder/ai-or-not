import { useGame } from '../contexts/GameProvider';

const LivesDisplay = () => {
  const { lives } = useGame();

  const hearts = Array.from({ length: 3 }, (_, index) => {
    return index < lives ? '💙' : '🩵';
  });

  return (
    <div className="flex flex-col gap-2 text-3xl">
      {hearts.map((heart, index) => (
        <span
          key={index}
          className={`${heart === '💙' ? '' : 'opacity-20'} heart-shadow`}
        >
          {heart}
        </span>
      ))}
    </div>
  );
};

export default LivesDisplay;
