import { useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameProvider';
import { motion, AnimatePresence } from 'framer-motion';

const RoundDisplay: React.FC = () => {
  const { round } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [round]);

  return (
    <div className="fixed inset-0 flex items-end justify-center overflow-visible z-10">
      <div
        ref={containerRef}
        className="relative w-full max-w-96 max-h-screen pt-[30vh] overflow-y-auto scrollbar-hide"
      >
        <motion.div className="pb-[50vh] mx-12 flex flex-col gap-8">
          <AnimatePresence initial={true}>
            {round.map(({ id, element }) => (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, y: 140 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {element}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default RoundDisplay;
