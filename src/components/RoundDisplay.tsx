import React, { useEffect, useState } from 'react';
import { useComment } from '../contexts/CommentProvider';
import { motion, AnimatePresence } from 'framer-motion';
import CommentCard from './CommentCard';
import Dialogue from './Dialogue';
import { Events } from '../contexts/Events';

const RoundDisplay: React.FC = () => {
  const { fetchedComment } = useComment();
  const [elements, setElements] = useState<JSX.Element[]>([
    <Dialogue>Press a button to start the round</Dialogue>,
  ]);

  useEffect(() => {
    const resetRound = () => {
      setElements([<Dialogue>Start the round</Dialogue>]);
    };

    Events.subscribe('incorrect', resetRound);

    return () => {
      Events.unsubscribe('incorrect', resetRound);
    };
  }, []);

  useEffect(() => {
    if (fetchedComment) {
      setElements(prevElements => [
        ...prevElements,
        <CommentCard comment={fetchedComment} />,
      ]);
    }
  }, [fetchedComment]);

  return (
    <motion.div className="fixed bottom-[45%] w-full max-w-96 px-12 overflow-visible flex flex-col gap-8 z-10">
      <AnimatePresence initial={false}>
        {elements.map((element, index) => (
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
