import React from 'react';

interface ParticleProps {
  color: string;
}

const Particle: React.FC<ParticleProps> = ({ color }) => {
  const style = {
    backgroundColor: color,
    width: `${Math.random() * 5 + 5}px`,
    height: `${Math.random() * 5 + 5}px`,
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 300 + 500}ms`,
    animationDelay: `${Math.random() * 200}ms`,
  };

  return <div className="particle" style={style} />;
};

export default Particle;
