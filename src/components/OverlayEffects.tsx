import { useEffect, useState } from 'react';
import { Events } from '../contexts/Events';
import Particle from './Particle';
import correctSound from '../assets/correct.wav';
import incorrectSound from '../assets/incorrect.wav';

const OverlayEffects: React.FC = () => {
  const [glow, setGlow] = useState<'none' | 'green' | 'red'>('none');
  const [particles, setParticles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const glow = (color: 'green' | 'red') => {
      setGlow(color);
      setTimeout(() => setGlow('none'), 100);
    };

    const playSound = (soundFile: string) => {
      new Audio(soundFile).play();
    };

    const generateParticles = (color: string) => {
      const newParticles = Array.from({ length: 20 }, (_, index) => (
        <Particle key={Date.now() + index} color={color} />
      ));
      setParticles(prevParticles => [...prevParticles, ...newParticles]);
    };

    const handleCorrect = () => {
      glow('green');
      playSound(correctSound);
      generateParticles('green');
    };

    const handleIncorrect = () => {
      glow('red');
      playSound(incorrectSound);
      generateParticles('red');
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
    <>
      <div
        className={`fixed inset-0 z-10 pointer-events-none ${glowClass} ${
          glow !== 'none' ? '' : 'transition-all duration-1000 ease-in'
        }`}
      />
      {particles}
    </>
  );
};

export default OverlayEffects;
