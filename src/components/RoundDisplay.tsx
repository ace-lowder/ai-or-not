import { useEffect, useState } from 'react';
import { useComment } from '../contexts/CommentProvider';
import { motion, AnimatePresence } from 'framer-motion';
import CommentCard from './CommentCard';
import { Events } from '../contexts/Events';

interface Comment {
  profilePicture: string;
  username: string;
  comment: string;
  likes: number;
  date: string;
}

const RoundDisplay: React.FC = () => {
  const { fetchedComment } = useComment();
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const resetRound = () => {
      setComments([]);
    };

    Events.subscribe('incorrect', resetRound);

    return () => {
      Events.unsubscribe('incorrect', resetRound);
    };
  }, []);

  useEffect(() => {
    if (fetchedComment) {
      setComments(prevComments => [...prevComments, fetchedComment]);
    }
  }, [fetchedComment]);

  return (
    <motion.div className="fixed bottom-[45%] overflow-visible flex flex-col gap-8 z-10">
      <AnimatePresence initial={false}>
        {comments.map((comment, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, y: 140 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CommentCard comment={comment} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default RoundDisplay;
