import { useEffect, useState } from 'react';
import { Events } from '../contexts/Events';
import correctSound from '../assets/correct.mp3';
import incorrectSound from '../assets/incorrect.mp3';

const OverlayEffects: React.FC = () => {
  const [glow, setGlow] = useState<'none' | 'green' | 'red'>('none');

  useEffect(() => {
    const glow = (color: 'green' | 'red') => {
      setGlow(color);
      const timeout = setTimeout(() => setGlow('none'), 100);
      return () => clearTimeout(timeout);
    };

    const playSound = (soundFile: string) => {
      const audio = new Audio(soundFile);
      audio.play();
    };

    const handleCorrect = () => {
      glow('green');
      playSound(correctSound);
    };

    const handleIncorrect = () => {
      glow('red');
      playSound(incorrectSound);
    };

    Events.subscribe('correct', handleCorrect);
    Events.subscribe('incorrect', handleIncorrect);

    return () => {
      Events.unsubscribe('correct', handleCorrect);
      Events.unsubscribe('incorrect', handleIncorrect);
    };
  }, []);

  const glowClass =
    glow === 'green'
      ? 'shadow-[inset_0_0_100px_10px_rgba(0,255,0,0.3)]'
      : glow === 'red'
      ? 'shadow-[inset_0_0_100px_10px_rgba(255,0,0,0.3)]'
      : '';

  return (
    <div
      className={`fixed inset-0 z-10 pointer-events-none ${glowClass} ${
        glow !== 'none' ? '' : 'transition-all duration-1000 ease-in'
      }`}
    />
  );
};

export default OverlayEffects;
