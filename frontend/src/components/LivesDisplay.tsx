import { useGame } from '../contexts/GameProvider';
import hoverSound from '../assets/pop.mp3';

const LivesDisplay = () => {
  const { lives } = useGame();

  const hearts = Array.from({ length: 3 }, (_, index) => {
    return index < lives ? '💙' : '🩵';
  });

  const playHoverSound = () => {
    const audio = new Audio(hoverSound);
    const pitch = Math.random() * 0.2 + 0.8;
    audio.playbackRate = pitch;
    audio.volume = 0.05;
    audio.play();
  };

  return (
    <div className="flex flex-col gap-2 text-3xl">
      {hearts.map((heart, index) => (
        <span
          key={index}
          className={`transition-transform ${
            heart === '💙' ? 'hover:scale-[1.2]' : 'opacity-20'
          }`}
          onMouseEnter={heart === '💙' ? playHoverSound : undefined}
        >
          {heart}
        </span>
      ))}
    </div>
  );
};

export default LivesDisplay;
