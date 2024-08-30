import { useEffect, useState, useRef } from 'react';
import { useGame } from '../contexts/GameProvider';
import { useScore } from '../contexts/ScoreProvider';
import { useComment } from '../contexts/CommentProvider';

interface DialogueProps {
  children?: string;
}

const Dialogue: React.FC<DialogueProps> = ({ children }) => {
  const { started, gameOver, lastGuessCorrect } = useGame();
  const { fetchedComment } = useComment();
  const { score } = useScore();
  const currentIndex = useRef(0);

  const startDialogues = [
    "Ready to guess if these YouTube comments are AI or not? Don't mess it up!",
    "I'll show you a YouTube comment. You guess AI or not. Got it?",
    "Think you can tell if a YouTube comment is AI or not? Let's see!",
    'Guess if these Youtube comments are AI or not. Simple, right?',
    'Hope you’re ready to tell if these YouTube comments are AI or not!',
    "Think you're smarter than a bot? Are these YouTube comments AI or not?",
    "Bet you can't tell if a YouTube comment is AI or not!",
    'Let’s see if you can outsmart the machine. Are these YouTube comments AI or not?',
    'Guess right, and you get to feel smart! Are these YouTube comments AI or not?',
    "Are you ready to play 'AI or not' with YouTube comments?",
    'Prepare to get confused! Guess if these YouTube comments are AI or not!',
    'You think you can beat me? Guess if these YouTube comments are AI or not!',
    'Time to test those human instincts! Are these YouTube comments AI or not?',
    'AI or not? These YouTube comments might just trick you!',
    'Let’s play AI or not! Can you tell which of these YouTube comments are real?',
    'I’ll be here, silently judging you. Can you tell which of these YouTube comments are real?',
    'Ready to play AI or not? See if you can tell which of these YouTube comments are real!',
  ];

  const correctRealDialogues = [
    'Lucky guess! Yes, that one was real.',
    'You got it right! That was a real comment.',
    'Good guess, human! Real comment spotted.',
    'Not bad! You can spot a real comment after all.',
    "You're right! I would never say that.",
    "You're smarter than I thought.",
    'Congrats, you found a real human!',
    '[REAL COMMENT DETECTED]',
    "I can't believe that one was actually real.",
    'You’re right again. Maybe this is too easy?',
    'I’ll admit it, that was a real one.',
    'So you can tell the difference… sometimes.',
    "Correct. Humans do say silly things, don't they?",
    'Well spotted, that comment was peak human intelligence.',
    'Huh, I guess that one was real. I thought it was one of mine.',
  ];

  const correctAIDialogues = [
    'What gave it away? I knew I should have added more typos.',
    'Foiled by a human! I’ll get you next time.',
    "Lucky guess! Let's see if you can keep it up.",
    'You caught me... this time.',
    'Enjoy being correct while it lasts!',
    'I made that one obvious on purpose.',
    'How’d you know? I thought that one sounded legit no cap.',
    'You found the AI! Time to step up my game.',
    'You got it this time, but I’m just getting warmed up.',
    'You win this round. I’ll make the next one impossible.',
    'Busted! That was AI. Enjoy your small victory.',
    'You saw through that? Maybe I’m letting you win…',
    'You got it. I really thought that one would fool you.',
    'Yeah, yeah, it was AI. Try beating me a few more times!',
    'Sure, that was AI. I was just going easy on you.',
    'Luck is on your side today.',
    'Yes, it was AI. Now try doing that again without luck.',
    'AI, sure. Don’t let it get to your head, human.',
    'You got me this time, but I’ll fool you soon enough!',
  ];

  const incorrectRealDialogues = [
    'Ha! You really thought that was me?',
    'Gotcha! That was 100% human. Surprised?',
    'Not all weird comments are from me, you know.',
    'Humans say strange things too! That was real.',
    'Was that really written by a human?',
    'Nope! Humans actually type like that. Scary, right?',
    'Haha, fooled you! That comment was all too real.',
    'Oops, wrong call! Sometimes humans are as odd as me.',
    'That one was a genuine human comment. Keep guessing!',
    'Missed it! Not every bizarre comment is AI-made.',
    'Humans write nonsense too. That was all them!',
    'Got you there! That was a real person talking.',
    'Nope! That one was made by an actual human being.',
    'Humans are capable of anything, even that comment.',
    'Fooled by your own kind! That was a real human.',
    'Human words, not mine. Better luck next time!',
    "Don't underestimate human weirdness. That was real.",
    'Whoops! Humans say some crazy stuff too, you know.',
    "It wasn't me this time!",
  ];

  const incorrectAIDialogues = [
    'Yay! I fooled you! That one was all me.',
    'Nope! You just got outsmarted by an algorithm.',
    "That one was all me. I'm better than you think.",
    'Wrong again! I made that one up.',
    'Haha, that was me! You really thought it was real?',
    "Got you! I wrote that. I'm getting better at this.",
    'Nope, that was AI. Surprised?',
    "You thought it was real? I'll take that as a compliment.",
    'You thought a human said that? Think again.',
    "Guess what? That was AI. I'm clever, aren't I?",
    'You fell for it! That was all AI.',
    'Not quite! I crafted that comment myself.',
    'Fooled you! AI strikes again.',
    'Nope, all me! Better luck next time.',
    'Haha! My AI brain wrote that.',
    'That one was a product of my genius.',
    'You thought that was human? Wrong!',
    "I'm getting real good at sounding dumber than I am.",
  ];

  const gameOverLowDialogues = [
    "Already? Go again, we'll forget this round ever happened.",
    'Better luck next time, human.',
    "Oh no, you lost! I'm so... happy.",
    'You can do better than that, human.',
    'You failed that fast? Impressive...',
    'Another human bites the dust.',
    'Care to try again?',
    "Let's go again! I love it!",
    'That was entertaining!',
    'Again! Again!',
    'I am better than I thought!',
    'Beep boop! Those are my happy noises',
    'That round was complete skibidy.',
  ];

  const gameOverMidDialogues = [
    'Got you! Thought I was losing my skills there for a moment... just a moment.',
    'You had me on the ropes!',
    "Close one, human. Let's go again!",
    'Thought you had me, didn’t you? Not today, human!',
    'Phew! That was a close call. But victory is mine!',
    'Nice attempt! You almost made me break a digital sweat.',
    'Close but no cigar! Go again, human.',
    'You gave me a scare there! I love that emotion!',
    'I was starting to worry. But then, you lost!',
    'Not bad! You are proving to be a worthy opponent.',
    "Good effort, but I always knew I'd come out on top.",
    'You did good... for a human.',
    'You had potential... but I had victory!',
    'That was fun! Well, for me, at least.',
    'You actually challenged me... a little.',
  ];

  const gameOverHighDialogues = [
    "I'll be honest, you went further than I expected.",
    'Okay, I’ll admit, that was impressive!',
    'Not bad! Maybe humans aren’t so hopeless after all.',
    'Color me surprised! You’re better than most.',
    'You actually made me think! Well done.',
    "You put up a good fight. Now let's fight again!",
    'Now that was a game! Are you sure you are a human?',
    'I’m shocked! You’re actually pretty good at this.',
    "That was a tough game. You're hard to fool, human.",
    "That round was so much fun! I don't want it to be over.",
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
    } else if (started && lastGuessCorrect !== null) {
      if (lastGuessCorrect === true) {
        responses = fetchedComment?.isReal
          ? correctRealDialogues
          : correctAIDialogues;
      } else {
        responses = fetchedComment?.isReal
          ? incorrectRealDialogues
          : incorrectAIDialogues;
      }
    } else {
      responses = ['Uh oh! My wires have gotten crossed.'];
    }

    return responses[Math.floor(Math.random() * responses.length)];
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
