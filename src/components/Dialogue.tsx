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
    }, visibleWords[visibleWords.length - 1].length * 20 + 100);

    return () => clearInterval(interval);
  }, [words]);

  return (
    <div className="flex gap-[5.5rem] items-center">
      <div className="float my-auto text-sm text-gray-700 inset-0">
        `<span className="-top-6 text-6xl sway absolute">🤖</span>
      </div>
      <div className="bg-white outline outline-[6px] outline-gray-700 text-gray-700 font-bold text-center rounded-xl p-4 w-full shadow-lg relative">
        <span className="text-white">{children}</span>
        <span className="absolute inset-0 p-4 box-content">
          {visibleWords.join(' ')}
        </span>
      </div>
    </div>
  );
};

export default Dialogue;
