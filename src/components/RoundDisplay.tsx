import { useEffect, useRef, useState } from 'react';
import { useGame } from '../contexts/GameProvider';
import { motion, AnimatePresence } from 'framer-motion';

const RoundDisplay: React.FC = () => {
  const { round } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleStart = (e: MouseEvent | TouchEvent) => {
      const clientY =
        e instanceof TouchEvent ? e.touches[0].clientY : e.clientY;
      setStartY(clientY);
      setIsDragging(true);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientY =
        e instanceof TouchEvent ? e.touches[0].clientY : e.clientY;
      const diff = clientY - startY;

      if (
        containerRef.current &&
        (containerRef.current.scrollTop === 0 ||
          containerRef.current.scrollHeight - containerRef.current.scrollTop ===
            containerRef.current.clientHeight)
      ) {
        containerRef.current.style.transform = `translateY(${diff * 0.1}px)`;
      }
    };

    const handleEnd = () => {
      if (containerRef.current) {
        containerRef.current.style.transition = 'transform 0.2s ease-out';
        containerRef.current.style.transform = 'translateY(0px)';
      }
      setIsDragging(false);
      setStartY(0);
    };

    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return;

      const scrollTop = containerRef.current.scrollTop;
      const maxScroll =
        containerRef.current.scrollHeight - containerRef.current.clientHeight;

      if (
        (scrollTop <= 0 && e.deltaY < 0) ||
        (scrollTop >= maxScroll && e.deltaY > 0)
      ) {
        const overscrollAmount = e.deltaY * 0.4;
        containerRef.current.style.transform = `translateY(${
          overscrollAmount * -1
        }px)`;
        e.preventDefault();
      } else {
        containerRef.current.style.transform = 'translateY(0px)';
      }

      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = 'transform 0.6s ease-out';
          containerRef.current.style.transform = 'translateY(0px)';
        }
      }, 200);
    };

    const container = containerRef.current;
    container?.addEventListener('mousedown', handleStart);
    container?.addEventListener('mousemove', handleMove);
    container?.addEventListener('mouseup', handleEnd);
    container?.addEventListener('mouseleave', handleEnd);
    container?.addEventListener('touchstart', handleStart);
    container?.addEventListener('touchmove', handleMove);
    container?.addEventListener('touchend', handleEnd);
    container?.addEventListener('wheel', handleWheel);

    return () => {
      container?.removeEventListener('mousedown', handleStart);
      container?.removeEventListener('mousemove', handleMove);
      container?.removeEventListener('mouseup', handleEnd);
      container?.removeEventListener('mouseleave', handleEnd);
      container?.removeEventListener('touchstart', handleStart);
      container?.removeEventListener('touchmove', handleMove);
      container?.removeEventListener('touchend', handleEnd);
      container?.removeEventListener('wheel', handleWheel);
    };
  }, [isDragging, startY]);

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
        className="relative w-full max-w-96 md:max-w-[480px] max-h-screen pt-[30vh] overflow-y-auto scrollbar-hide"
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
