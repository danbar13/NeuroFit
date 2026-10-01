import React from 'react';

export interface ReactionParticle {
  id: number;
  emoji: string;
  x: number; // offset in px
}

interface FloatingReactionProps {
  particles: ReactionParticle[];
}

export const FloatingReaction: React.FC<FloatingReactionProps> = ({ particles }) => {
  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-30">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute text-3xl sm:text-4xl animate-float-fade"
          style={{
            left: `calc(50% + ${p.x}px)`,
            bottom: '10px',
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
};
