import { useEffect, useState } from 'react';
import { Events } from '../contexts/Events';

const OverlayEffects: React.FC = () => {
  const [glow, setGlow] = useState<'none' | 'green' | 'red'>('none');

  useEffect(() => {
    const glow = (color: 'green' | 'red') => {
      setGlow(color);
      const timeout = setTimeout(() => setGlow('none'), 100);
      return () => clearTimeout(timeout);
    };

    Events.subscribe('correct', () => glow('green'));
    Events.subscribe('incorrect', () => glow('red'));

    return () => {
      Events.unsubscribe('correct', () => glow('green'));
      Events.unsubscribe('incorrect', () => glow('red'));
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
      className={`fixed inset-0 z-10 pointer-events-none  ${glowClass} ${
        glow !== 'none' ? '' : 'transition-all duration-1000 ease-in'
      }`}
    />
  );
};

export default OverlayEffects;
