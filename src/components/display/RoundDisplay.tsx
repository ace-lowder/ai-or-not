import { useGame } from '../../contexts/GameProvider';
import { motion, AnimatePresence } from 'framer-motion';

const RoundDisplay: React.FC = () => {
  const { round } = useGame();

  return (
    <motion.div className="fixed bottom-[45%] w-full max-w-96 px-12 overflow-visible flex flex-col gap-8 z-10">
      <AnimatePresence initial={true}>
        {round.map((element, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, y: 140 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {element}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default RoundDisplay;
