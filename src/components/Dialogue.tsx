import { useEffect, useState, useRef } from 'react';
import { useGame } from '../contexts/GameProvider';
import { useScore } from '../contexts/ScoreProvider';
import { useComment } from '../contexts/CommentProvider';

interface DialogueProps {
  children?: string;
}

const Dialogue: React.FC<DialogueProps> = ({ children }) => {
  const { started, gameOver, round } = useGame();
  const { fetchedComment } = useComment();
  const { score } = useScore();
  const currentIndex = useRef(0);

  const startDialogues = [
    "Ready to guess if it's real or fake? Don't mess it up!",
    "I'll show you a comment. You guess real or AI. Got it?",
    "Think you can tell a real comment from AI? Let's see!",
    'Guess if the comment is real or AI. Simple, right?',
  ];

  const correctRealDialogues = [
    'Lucky guess! Yes, that one was real.',
    'You got it right! That was a real comment.',
    'Well done, human! Real comment spotted.',
    'Not bad! You can spot a real comment after all.',
  ];

  const correctAIDialogues = [
    'Right again! That was an AI comment.',
    'Good job! That one was cooked up by AI.',
    'Sharp eyes! You spotted the AI comment.',
    "You're getting good at this! That was AI.",
  ];

  const gameOverLowDialogues = [
    'Oops! You guessed wrong. Better luck next time!',
    'Game over! You thought you had it, huh?',
    'Not quite! That one tripped you up.',
    "Looks like you lost! Don't give up yet!",
  ];

  const gameOverMidDialogues = [
    'Close one! You did well, try again!',
    'Almost had it! Not bad though.',
    'Solid effort! But you missed the last one.',
  ];

  const gameOverHighDialogues = [
    'Wow! You almost beat me!',
    'Impressive score! Care for another round?',
    'You were on fire! Play again?',
  ];

  // Function to choose a response based on game state
  const chooseResponse = (): string => {
    let responses: string[] = [];

    if (!started) {
      responses = startDialogues;
    } else if (gameOver) {
      if (score <= 3) {
        responses = gameOverLowDialogues;
      } else if (score <= 10) {
        responses = gameOverMidDialogues;
      } else {
        responses = gameOverHighDialogues;
      }
    } else if (started && round.length > 1) {
      responses = fetchedComment?.isReal
        ? correctRealDialogues
        : correctAIDialogues;
    } else {
      responses = ['Uh oh! My wires have gotten crossed.'];
    }

    return (
      responses[Math.floor(Math.random() * responses.length)] ||
      "Let's start the game!"
    );
  };

  // Store the selected dialogue in a state variable
  const [selectedDialogue] = useState<string>(children || chooseResponse());

  // Set a default value for words to handle cases where selectedDialogue is empty
  const words = selectedDialogue ? selectedDialogue.split(' ') : [];
  const [visibleWords, setVisibleWords] = useState<string[]>(['']);

  useEffect(() => {
    if (words.length === 0) return;

    // Set a timeout to delay the start of the interval
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex.current < words.length) {
          const nextWord = words[currentIndex.current];
          setVisibleWords(prevWords => [...prevWords, nextWord]);
          currentIndex.current += 1;
        } else {
          clearInterval(interval); // Clear the interval when all words are shown
        }
      }, visibleWords[visibleWords.length - 1].length * 2 + 180);

      // Cleanup the interval when the component unmounts
      return () => clearInterval(interval);
    }, 200); // 200ms delay before the interval starts

    // Cleanup the timeout to prevent memory leaks
    return () => clearTimeout(timeout);
  }, [words]);

  return (
    <div className="flex gap-[5.5rem] items-center">
      <div className="float my-auto text-sm text-gray-700 inset-0">
        `<span className="-top-6 text-6xl sway absolute">🤖</span>
      </div>
      <div className="bg-white outline outline-[6px] outline-gray-700 text-gray-700 font-bold text-center rounded-xl p-4 w-full shadow-lg relative">
        <span className="text-white">{selectedDialogue}</span>
        <span className="absolute inset-0 p-4 box-content">
          {visibleWords.join(' ')}
        </span>
      </div>
    </div>
  );
};

export default Dialogue;
