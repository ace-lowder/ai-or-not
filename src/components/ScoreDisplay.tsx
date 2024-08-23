import React, { useEffect, useState } from 'react';
import { useScore } from '../contexts/ScoreProvider';
import { Events } from '../contexts/Events';

const ScoreDisplay: React.FC = () => {
  const { score } = useScore();
  const [glow, setGlow] = useState<'none' | 'green' | 'red'>('none');

  useEffect(() => {
    const showGreenGlow = () => setGlow('green');
    const showRedGlow = () => setGlow('red');

    Events.subscribe('correct', showGreenGlow);
    Events.subscribe('incorrect', showRedGlow);

    return () => {
      Events.unsubscribe('correct', showGreenGlow);
      Events.unsubscribe('incorrect', showRedGlow);
    };
  }, []);

  useEffect(() => {
    if (glow !== 'none') {
      const timeout = setTimeout(() => setGlow('none'), 100);
      return () => clearTimeout(timeout);
    }
  }, [glow]);

  const glowClass =
    glow === 'green'
      ? 'shadow-[inset_0_0_100px_10px_rgba(0,255,0,0.3)]'
      : glow === 'red'
      ? 'shadow-[inset_0_0_100px_10px_rgba(255,0,0,0.3)]'
      : '';

  return (
    <>
      <div
        className={`fixed inset-0 z-10 pointer-events-none  ${glowClass} ${
          glow !== 'none' ? '' : 'transition-all duration-1000 ease-in'
        }`}
      />
      <div className="bg-gray-800 text-white text-xl font-bold rounded-xl py-3 px-4 m-4 relative z-20">
        Score: {score}
      </div>
    </>
  );
};

export default ScoreDisplay;
