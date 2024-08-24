import { useEffect, useState } from 'react';

interface ParticleProps {
  color: string;
}

const Particle: React.FC<ParticleProps> = ({ color }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  const duration = Math.random() * 300 + 500;
  const delay = Math.random() * 200;
  const style = {
    backgroundColor: color,
    width: `${Math.random() * 5 + 5}px`,
    height: `${Math.random() * 5 + 5}px`,
    left: `${Math.random() * 100}%`,
    animationDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
  };

  useEffect(() => {
    const totalTime = duration + delay;
    const timeout = setTimeout(() => setIsAnimating(false), totalTime);
    return () => clearTimeout(timeout);
  }, [duration, delay]);

  if (!isAnimating) {
    return null;
  }

  return <div className="particle" style={style} />;
};

export default Particle;
