import { useEffect, useState } from 'react';
import { useComment } from '../contexts/CommentProvider';
import { motion, AnimatePresence } from 'framer-motion';
import CommentCard from './CommentCard';
import Dialogue from './Dialogue';
import { Events } from '../contexts/Events';

// Assuming Comment interface is defined as you have it
interface Comment {
  profilePicture: string;
  username: string;
  comment: string;
  likes: number;
  date: string;
}

interface DialogueElement {
  type: 'dialogue';
  text: string;
  id: number;
}

interface CommentElement {
  type: 'comment';
  data: Comment;
  id: number;
}

type DisplayElement = DialogueElement | CommentElement;

const RoundDisplay: React.FC = () => {
  const { fetchedComment } = useComment();
  const [elements, setElements] = useState<DisplayElement[]>([
    { type: 'dialogue', text: 'Press a button to start the round', id: 1 },
  ]);

  const [idCounter, setIdCounter] = useState(2);

  useEffect(() => {
    const resetRound = () => {
      setElements([
        {
          type: 'dialogue',
          text: 'Try again! Press a button to start the round',
          id: idCounter,
        },
      ]);
      setIdCounter(prev => prev + 1);
    };

    Events.subscribe('incorrect', resetRound);

    return () => {
      Events.unsubscribe('incorrect', resetRound);
    };
  }, [idCounter]);

  useEffect(() => {
    if (fetchedComment) {
      setElements(prevElements => [
        ...prevElements,
        { type: 'comment', data: fetchedComment, id: idCounter },
      ]);
      setIdCounter(prev => prev + 1); // Increment the counter
    }
  }, [fetchedComment]);

  return (
    <motion.div className="fixed bottom-[45%] w-full max-w-96 px-12 overflow-visible flex flex-col gap-8 z-10">
      <AnimatePresence initial={false}>
        {elements.map(element => (
          <motion.div
            key={element.id}
            layout
            initial={{ opacity: 0, y: 140 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {element.type === 'dialogue' ? (
              <Dialogue>{element.text}</Dialogue>
            ) : (
              <CommentCard comment={element.data} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default RoundDisplay;
