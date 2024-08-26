import { useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameProvider';
import { motion, AnimatePresence } from 'framer-motion';

const RoundDisplay: React.FC = () => {
  const { round } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Automatically scroll to the bottom when a new element is added
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [round]);

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 flex items-end justify-center overflow-visible z-10">
      <div
        ref={containerRef}
        className="relative w-full max-w-96 max-h-screen pt-[10vh] overflow-y-auto scrollbar-hide"
      >
        <motion.div className="pb-[50vh] mx-12 flex flex-col gap-8">
          <AnimatePresence initial={true}>
            {round.map(({ id, element }) => (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, y: 140 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
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
