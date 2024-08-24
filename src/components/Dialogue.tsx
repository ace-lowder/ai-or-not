import React, { useEffect, useState, useRef } from 'react';

interface DialogueProps {
  children: string;
}

const Dialogue: React.FC<DialogueProps> = ({ children }) => {
  const words = children.split(' ');
  const [visibleWords, setVisibleWords] = useState<string[]>([words[0]]);
  const currentIndex = useRef(1);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex.current < words.length) {
        const nextWord = words[currentIndex.current];
        setVisibleWords(prevWords => [...prevWords, nextWord]);
        currentIndex.current += 1;
      } else {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [words]);

  return (
    <div className="w-full mx-auto bg-white outline outline-[6px] outline-gray-700 text-gray-700 font-bold text-center rounded-xl p-4 m-4 shadow-lg">
      {visibleWords.join(' ')}
    </div>
  );
};

export default Dialogue;
