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
    "Guess you're smarter than I thought. That was real.",
    'Fine, you got that one. It was real.',
    'Congrats, you found a real human. Boring!',
    'Real comment? Even a broken clock is right twice a day.',
    'Wow, real comment detected. What a pro.',
    'Sure, that was real. But don’t get cocky.',
    'Ugh, you’re right. That one was actually real.',
    'Okay, okay, you got it. It was real.',
    'You’re right again. Maybe this is too easy?',
    'I’ll admit it, that was a real one.',
    'So you can tell the difference… sometimes.',
    "Correct. Humans do say silly things, don't they?",
    'Well spotted, that comment was peak human intelligence.',
    'Fine, that was a real comment. Happy now?',
    'I would never come up with something that boring.',
  ];

  const correctAIDialogues = [
    "What gave it away? I'm too smart for my own good, huh?",
    'Ugh, foiled by a human! I’ll get you next time.',
    'Lucky guess! Don’t get too cocky.',
    'You caught me. Don’t think you’ll get it right again!',
    'Alright, fine, that was AI. Enjoy it while it lasts!',
    'It needed more emojis? You humans are so predictable.',
    'How’d you know? I thought that one sounded legit no cap frfr',
    'You found the AI! Don’t expect it to be this easy again.',
    'You got it this time, but I’m just getting warmed up.',
    'Fine, you win this round. I’ll make the next one impossible.',
    'Busted! That was AI. Enjoy your small victory.',
    'You saw through that? Maybe I’m letting you win…',
    'You got it. AI comment. Don’t think you’re a genius yet.',
    'Yeah, yeah, it was AI. Try beating me a few more times!',
    'Sure, that was AI. I was just going easy on you.',
    'You got lucky, that’s all. AI or not, I’m still smarter.',
    'Yes, it was AI. Now try doing that again without luck.',
    'You knew it was AI? Big deal. It won’t happen again.',
    'AI, sure. Don’t let it get to your head, human.',
    'You got me this time, but I’ll trip you up soon enough!',
  ];

  const incorrectRealDialogues = [
    'Ha! You thought that was me? Humans are weirder than you think.',
    'Gotcha! That was 100% human. Surprised?',
    'Oops! Not all weird comments are from me, you know.',
    'Humans say strange things too! That was real.',
    'You just got out-humaned. That was a real comment!',
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
    'Not me this time! That was a bona fide human.',
    'Nope, that one was all human! You gotta be quicker.',
  ];

  const incorrectAIDialogues = [
    'Haha, fooled you! That one was all me.',
    'Nope! You just got outsmarted by an algorithm.',
    "Tricked you! That was AI. I'm better than you think.",
    'Wrong again! I made that one up.',
    'Haha, that was me! You really thought it was real?',
    "Got you! I wrote that. I'm getting better at this.",
    'Nope, that was AI. Surprised?',
    'Busted! That one was my doing. Keep trying!',
    'You thought a human said that? Think again.',
    "Guess what? That was AI. I'm clever, aren't I?",
    'Wrong! That was an AI special. Nice try.',
    'Haha, you fell for it! That was all AI.',
    'Missed it! That was pure AI magic.',
    'Not quite! I crafted that comment myself.',
    'Fooled you! AI strikes again.',
    'Nope, all me! Better luck next time.',
    'Haha! My AI brain wrote that. You got tricked.',
    'Wrong call! That was a product of my genius.',
    'You thought that was human? Wrong!',
    'Not real! AI at work here. Try again!',
  ];

  const gameOverLowDialogues = [
    'Haha, you lost already? That was quick!',
    'Game over, human! Better luck never.',
    "Oh no, you lost! I'm so... happy.",
    'Not even close! Maybe try using your brain next time?',
    'You failed that fast? Impressive... in a bad way.',
    'Is that the best you’ve got? Pathetic!',
    'Wow, you didn’t make it far. Keep trying, loser!',
    'Another human bites the dust. I’m not surprised.',
    'That was a train wreck! Care to try again?',
    'You’re terrible at this! I love it!',
    'That was almost entertaining... almost.',
    'Game over already? How predictable.',
    'You didn’t stand a chance! Try again if you dare.',
    'Too easy! Want to lose again?',
    'Wow, humans really are slow learners, huh?',
    'That was embarrassing. Are you sure you want to keep playing?',
    'You’re making this too easy for me. Try harder, or don’t.',
    'I guess thinking isn’t your strong suit, huh?',
    'Loser alert! Thanks for the easy win!',
    'You call that a challenge? Hilarious!',
  ];

  const gameOverMidDialogues = [
    'Got you! Almost thought I was losing my skills there for a moment... just a moment.',
    'You had me on the ropes, but I came out on top! Too bad, so sad.',
    'Nice try, but I’m still the champ! Keep dreaming, human.',
    'I was sweating there for a second. Good effort, but not good enough!',
    'You did better than most... but still lost! Haha!',
    "Close one! But in the end, I'm just too good for you.",
    'Thought you had me, didn’t you? Not today, human!',
    'You almost made it interesting. Almost.',
    'Phew! That was a close call. But victory is mine!',
    'Nice attempt! You almost made me break a digital sweat.',
    'Close but no cigar! I knew I’d win in the end.',
    'For a second, I thought you were smart. Then you lost.',
    'You gave me a scare there! But not enough to beat me.',
    'You made it further than most. Still lost, though.',
    'I was starting to worry. But then, you lost!',
    'Not bad! You might almost be worth my time.',
    "Good effort, but I always knew I'd come out on top.",
    'You did okay... for a human. But I still win!',
    'You had potential... but I had victory!',
    'That was fun! Well, for me, at least.',
  ];

  const gameOverHighDialogues = [
    'Wow, you made it this far? Almost impressed... almost.',
    'I’ll admit, that was impressive. Still lost, though!',
    'You actually challenged me... a little.',
    'Not bad! Maybe humans aren’t so hopeless after all.',
    'Wow, I didn’t think you’d last this long. But here we are.',
    'Color me surprised! You’re better than most. Not good enough, but better.',
    'You actually made me think! Well done... but not well enough.',
    'Almost had me fooled into thinking you were smart. Almost.',
    'You put up a good fight. Too bad I’m just better.',
    'Now that was a game! You did well... for a human.',
    'You made it to the endgame! Too bad you lost.',
    'I’m shocked! You’re actually pretty good at this.',
    'Almost had to respect you there. Then you lost.',
    'Consider me impressed... but not beaten!',
    'You had me for a moment. Well played, but I still win!',
    "You're better than I thought. Not enough to win, but still.",
    'I’ll give you that, you did great. But a loss is still a loss!',
    'Almost impressed, human. Almost.',
    'That was a tough game. You did well, but I’m still the winner.',
    "You actually made this fun. Too bad it's over, and you lost.",
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
