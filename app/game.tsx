"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaArrowRight, FaPlay, FaRobot, FaSync } from "react-icons/fa";
import { IoPerson } from "react-icons/io5";

const introLines = ["Ready to guess if these YouTube comments are AI or not? Don't mess it up!", "Think you're smarter than a bot? Are these YouTube comments real?", "Let's see if you can outsmart the machine."];
const correctRealLines = ["Lucky guess! Yes, that one was real.", "Good guess, human! Real comment spotted.", "Humans do say silly things, don't they?"];
const correctAiLines = ["What gave it away? I knew I should have added more typos.", "You caught me... this time.", "You found the AI! Time to step up my game."];
const incorrectRealLines = ["Ha! You really thought that was me?", "Not all weird comments are from me, you know.", "Humans say strange things too! That was real."];
const incorrectAiLines = ["Yay! I fooled you! That one was all me.", "Nope, that was AI. Surprised?", "You thought that was human? Wrong!"];

export default function Game() {
  const [round, setRound] = useState<RoundItem[]>(createOpeningRound);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => typeof window === "undefined" ? 0 : Number(localStorage.getItem("hiscore") ?? 0));
  const [lives, setLives] = useState(3);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [flash, setFlash] = useState<"correct" | "incorrect" | null>(null);
  const [scoreHighlight, setScoreHighlight] = useState<"correct" | "reset" | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [commentCache, setCommentCache] = useState<CommentCache>(readCommentCache);
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const commentCacheRef = useRef(commentCache);
  const pendingCacheRefills = useRef(new Set<CommentSource>());

  useEffect(() => {
    if (started) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [round, started]);

  useEffect(() => {
    localStorage.setItem("ai-or-not-comment-cache", JSON.stringify(commentCache));
  }, [commentCache]);

  const play = useCallback((file: string, volume: number) => {
    const sound = new Audio(`/game/${file}`);
    sound.volume = volume;
    sound.playbackRate = Math.random() * 0.2 + 0.8;
    void sound.play().catch(() => undefined);
  }, []);

  const pause = useCallback(() => {
    setDisabled(true);
    window.setTimeout(() => setDisabled(false), 300);
  }, []);

  const highlightScore = useCallback((type: "correct" | "reset") => {
    setScoreHighlight(type);
    window.setTimeout(() => setScoreHighlight(null), 50);
  }, []);

  const addDialogue = useCallback((text: string) => {
    setRound((items) => [...items, { id: crypto.randomUUID(), kind: "dialogue", text }]);
    setWaiting(true);
    play("woosh.mp3", 0.05);
  }, [play]);

  const replaceCommentCache = useCallback((nextCache: CommentCache) => {
    commentCacheRef.current = nextCache;
    setCommentCache(nextCache);
  }, []);

  const fetchComments = useCallback(async (source: CommentSource, count: number) => {
    const response = await fetch("/api/round", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, count }),
    });
    const payload = await response.json() as { comments?: Comment[]; error?: string };
    if (!response.ok || !payload.comments?.length) throw new Error(payload.error ?? "Couldn't load live comments. Try again.");
    return payload.comments;
  }, []);

  const refillCommentCache = useCallback(async (source: CommentSource, count: number) => {
    if (pendingCacheRefills.current.has(source)) return;

    pendingCacheRefills.current.add(source);
    try {
      const comments = await fetchComments(source, count);
      const current = commentCacheRef.current;
      replaceCommentCache({ ...current, [source]: [...current[source], ...comments].slice(0, cacheSize[source]) });
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : "Couldn't load live comments. Try again.");
    } finally {
      pendingCacheRefills.current.delete(source);
    }
  }, [fetchComments, replaceCommentCache]);

  const addComment = useCallback(async () => {
    if (isLoadingComment) return;

    setIsLoadingComment(true);
    setCommentError(null);
    const source: CommentSource = Math.random() > 0.4 ? "real" : "ai";
    let comment = commentCacheRef.current[source][0];

    try {
      if (comment) {
        const current = commentCacheRef.current;
        replaceCommentCache({ ...current, [source]: current[source].slice(1) });
      } else {
        const comments = await fetchComments(source, cacheSize[source]);
        comment = comments[0];
        const current = commentCacheRef.current;
        replaceCommentCache({ ...current, [source]: comments.slice(1) });
      }

      setRound((items) => [...items, { id: crypto.randomUUID(), kind: "comment", comment, revealed: false }]);
      setWaiting(false);
      play("woosh.mp3", 0.05);

      if (commentCacheRef.current[source].length <= 5) void refillCommentCache(source, cacheSize[source] - commentCacheRef.current[source].length);
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : "Couldn't load live comments. Try again.");
    } finally {
      setIsLoadingComment(false);
    }
  }, [fetchComments, isLoadingComment, play, refillCommentCache, replaceCommentCache]);

  const start = useCallback(() => {
    setStarted(true);
    void addComment();
    pause();
  }, [addComment, pause]);

  const restart = useCallback(() => {
    setRound(createOpeningRound());
    setScore(0);
    setLives(3);
    setStarted(false);
    setGameOver(false);
    setWaiting(true);
    highlightScore("reset");
    pause();
  }, [highlightScore, pause]);

  const guess = useCallback((isReal: boolean) => {
    const latest = [...round].reverse().find((item) => item.kind === "comment");
    if (!latest || disabled || isLoadingComment) return;

    const correct = latest.comment.isReal === isReal;
    setRound((items) => items.map((item) => item.id === latest.id ? { ...item, revealed: true } : item));
    setFlash(correct ? "correct" : "incorrect");
    window.setTimeout(() => setFlash(null), 140);
    setParticles(createParticles(correct ? "#22c55e" : "#ef4444"));
    window.setTimeout(() => setParticles([]), 900);
    play(correct ? "correct.wav" : "incorrect.wav", correct ? 0.1 : 0.07);
    pause();

    if (correct) {
      setScore((value) => value + 1);
      highlightScore("correct");
      if (Math.random() > 0.2) void addComment();
      else addDialogue(pickLine(latest.comment.isReal ? correctRealLines : correctAiLines));
      return;
    }

    const nextLives = lives - 1;
    setLives(nextLives);
    addDialogue(pickLine(latest.comment.isReal ? incorrectRealLines : incorrectAiLines));
    if (nextLives > 0) return;

    const nextBestScore = Math.max(bestScore, score);
    setBestScore(nextBestScore);
    localStorage.setItem("hiscore", String(nextBestScore));
    setGameOver(true);
    setRound((items) => [...items, { id: crypto.randomUUID(), kind: "game-over", score }]);
  }, [addComment, addDialogue, bestScore, disabled, highlightScore, isLoadingComment, lives, pause, play, round, score]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isAi = ["a", "A", "1", "ArrowLeft"].includes(event.key);
      const isReal = ["d", "D", "2", "ArrowRight"].includes(event.key);
      if (!isAi && !isReal) return;
      if (gameOver) restart();
      else if (!started || waiting) start();
      else guess(isReal);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, guess, restart, start, started, waiting]);

  const primary = useMemo<Action>(() => {
    if (gameOver) return { label: "Restart", icon: "↻", tone: "red", onClick: restart };
    if (!started) return { label: "Start", icon: "▶", tone: "green", onClick: start };
    if (waiting) return { label: "Continue", icon: "→", tone: "green", onClick: start };
    return { label: "AI", icon: "🤖", tone: "blue", onClick: () => guess(false) };
  }, [gameOver, guess, restart, start, started, waiting]);

  return <main className="game-background relative flex min-h-dvh select-none flex-col items-center justify-center overflow-hidden bg-gray-900 text-white">
    <div className="relative flex h-dvh w-full max-w-[480px] flex-col md:max-h-[720px] md:max-w-[720px]">
      <header className="relative z-20 flex justify-between p-4"><Score score={score} bestScore={bestScore} highlight={scoreHighlight} play={play} /><Lives lives={lives} play={play} /></header>
      <section className="fixed inset-0 z-0 flex items-end justify-center overflow-visible"><div ref={scrollRef} className={`scrollbar-hide relative max-h-screen w-full max-w-96 overflow-y-auto ${started ? "pt-[30vh]" : "pt-9"} md:max-w-[480px]`}><div className="mx-12 flex flex-col gap-8 pb-[50vh]">{round.map((item) => <RoundEntry key={item.id} item={item} />)}</div></div></section>
      {commentError && <p className="relative z-20 mx-4 rounded bg-red-600 px-3 py-2 text-center text-sm font-bold" role="alert">{commentError}</p>}
      <footer className="relative z-20 mt-auto flex gap-4 p-4"><GameButton action={primary} disabled={disabled || isLoadingComment} play={play} />{started && !waiting && !gameOver && <GameButton action={{ label: "Real", icon: "👤", tone: "red", onClick: () => guess(true) }} disabled={disabled || isLoadingComment} play={play} />}</footer>
    </div>
    <div className={`pointer-events-none fixed inset-0 z-10 ${flash === "correct" ? "game-flash-correct" : flash === "incorrect" ? "game-flash-incorrect" : ""}`} />
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">{particles.map((particle) => <span key={particle.id} className="game-particle" style={{ backgroundColor: particle.color, left: `${particle.left}%`, width: particle.size, height: particle.size, animationDuration: `${particle.duration}ms`, animationDelay: `${particle.delay}ms` }} />)}</div>
  </main>;
}

// === Components ===

const Score = ({ score, bestScore, highlight, play }: ScoreProps) => {
  const [showBest, setShowBest] = useState(false);
  const scoreColor = highlight === "correct" ? "text-green-500 text-3xl" : highlight === "reset" ? "text-red-500 text-3xl" : "text-white text-2xl transition-all duration-300";
  return <div className={`relative flex h-14 w-14 cursor-pointer select-none items-center justify-center rounded-xl bg-gray-800 font-bold shadow-lg outline-4 outline-gray-700 hover:duration-0 hover:bg-gray-700 hover:outline-gray-400 ${scoreColor}`} onMouseEnter={() => { play("switch.mp3", 0.04); setShowBest(true); }} onMouseLeave={() => setShowBest(false)}><span className="-translate-y-px">{score}</span>{showBest && <span className="absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm">Best: {bestScore}</span>}</div>;
};

const Lives = ({ lives, play }: LivesProps) => <div className="flex flex-col gap-2 text-3xl">{Array.from({ length: 3 }, (_, index) => index < lives).map((live, index) => <span key={index} className={live ? "transition-transform hover:scale-[1.2]" : "opacity-20"} onMouseEnter={live ? () => play("pop.mp3", 0.05) : undefined}>{live ? "💙" : "🩵"}</span>)}</div>;

const RoundEntry = ({ item }: { item: RoundItem }) => {
  if (item.kind === "logo") return <img className="h-auto w-full animate-game-enter" src="/game/logo.png" alt="AI or Not" />;
  if (item.kind === "dialogue") return <Dialogue text={item.text} />;
  if (item.kind === "game-over") return <div className="animate-game-enter text-center"><h1 className="text-4xl font-bold">Game Over</h1><p className="mt-2 text-xl font-semibold">Final Score: {item.score}</p></div>;
  return <CommentCard comment={item.comment} revealed={item.revealed} />;
};

const Dialogue = ({ text }: { text: string }) => {
  const [wordCount, setWordCount] = useState(0);
  const words = text.split(" ");
  useEffect(() => {
    let timer: number | undefined;
    const showNextWord = () => {
      setWordCount((count) => {
        const nextCount = Math.min(count + 1, words.length);
        if (nextCount === words.length && timer) window.clearInterval(timer);
        return nextCount;
      });
      const sound = new Audio("/game/beep.mp3");
      sound.volume = 0.03;
      sound.playbackRate = Math.random() * 2 + 4;
      void sound.play().catch(() => undefined);
    };
    const initialDelay = window.setTimeout(() => {
      showNextWord();
      timer = window.setInterval(showNextWord, 100);
    }, 100);

    return () => {
      window.clearTimeout(initialDelay);
      if (timer) window.clearInterval(timer);
    };
  }, [words.length]);
  return <div className="animate-game-enter flex items-center gap-[5.5rem]"><div className="animate-game-float relative w-0"><span className="animate-game-sway absolute -top-8 -left-1.5 block text-6xl" aria-hidden="true">🤖</span></div><div className="relative w-full rounded-xl bg-white p-4 text-center font-bold text-gray-700 shadow-lg outline-6 outline-gray-700"><span className="text-white">{text}</span><span className="absolute inset-0 box-content p-4">{words.slice(0, wordCount).join(" ")}</span></div></div>;
};

const CommentCard = ({ comment, revealed }: CommentCardProps) => <article className="animate-game-enter flex max-w-md flex-col gap-2 rounded bg-white p-4 text-gray-900 shadow-lg"><div className="flex items-center gap-2"><img src={revealed && !comment.isReal ? "/game/profile-ai.png" : comment.profilePicture} alt="Profile" className="h-8 w-8 rounded-full" /><span className="font-semibold md:text-lg">{revealed && !comment.isReal ? "Chat GPT" : comment.username}</span></div><p className="text-sm md:text-base">{decodeComment(comment.comment)}</p><span className="text-xs text-gray-500">{comment.date} • {comment.likes} likes</span>{revealed && comment.isReal && comment.video && <div className="mt-2 flex items-center gap-2"><img src={comment.video} alt="Video" className="h-auto w-1/2 rounded-md" /><div><small>Found on</small><strong className="block text-sm">{comment.videoName}</strong></div></div>}</article>;

const GameButton = ({ action, disabled, play }: GameButtonProps) => <button className={`relative flex-grow flex flex-col items-center gap-1 rounded-2xl rounded-b-3xl border border-4 border-gray-700 border-b-[12px] px-4 pt-6 pb-6 text-sm font-bold text-white transition-all duration-300 active:mt-2 active:border-b-[6px] active:pb-4 ${buttonTones[action.tone]}`} onClick={() => { play("click.mp3", 0.4); action.onClick(); }} disabled={disabled}>{action.icon === "▶" ? <FaPlay className="mt-2 h-10 w-10" /> : action.icon === "→" ? <FaArrowRight className="mt-2 h-10 w-10" /> : action.icon === "↻" ? <FaSync className="mt-2 h-10 w-10" /> : action.icon === "🤖" ? <FaRobot className="mt-2 h-10 w-10" /> : action.icon === "👤" ? <IoPerson className="mt-2 h-10 w-10" /> : <span className="text-4xl">{action.icon}</span>}{action.label}{action.icon === "🤖" && <span className="absolute top-2 left-2 hidden rounded-md bg-blue-200 px-1.5 py-0.5 text-xs font-bold text-blue-800 opacity-50 md:block">A</span>}{action.icon === "👤" && <span className="absolute top-2 right-2 hidden rounded-md bg-red-200 px-1.5 py-0.5 text-xs font-bold text-red-800 opacity-50 md:block">D</span>}</button>;

// === Helpers ===

const buttonTones = { blue: "bg-blue-500", green: "bg-green-500", red: "bg-red-500" };
const cacheSize = { real: 10, ai: 5 };
const createOpeningRound = (): RoundItem[] => [{ id: "logo", kind: "logo" }, { id: "intro", kind: "dialogue", text: introLines[0] }];
const pickLine = (lines: string[]) => lines[Math.floor(Math.random() * lines.length)];
const decodeComment = (comment: string) => comment.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<br>/g, " ").replace(/<[^>]*>/g, " ");
const createParticles = (color: string) => Array.from({ length: Math.round(window.innerWidth / 20) }, () => ({ id: crypto.randomUUID(), color, left: Math.random() * 100, size: Math.random() * 5 + 5, duration: Math.random() * 300 + 500, delay: Math.random() * 200 }));
const readCommentCache = (): CommentCache => {
  if (typeof window === "undefined") return { real: [], ai: [] };
  try {
    const stored = JSON.parse(localStorage.getItem("ai-or-not-comment-cache") ?? "{}") as Partial<CommentCache>;
    return { real: stored.real ?? [], ai: stored.ai ?? [] };
  } catch {
    return { real: [], ai: [] };
  }
};

// === Types ===

type Comment = { profilePicture: string; username: string; comment: string; likes: number; date: string; isReal: boolean; videoName?: string; video?: string };
type CommentSource = keyof typeof cacheSize;
type CommentCache = Record<CommentSource, Comment[]>;
type RoundItem = { id: string; kind: "logo" } | { id: string; kind: "dialogue"; text: string } | { id: string; kind: "comment"; comment: Comment; revealed: boolean } | { id: string; kind: "game-over"; score: number };
type Action = { label: string; icon: string; tone: "blue" | "green" | "red"; onClick: () => void };
type ScoreProps = { score: number; bestScore: number; highlight: "correct" | "reset" | null; play: (file: string, volume: number) => void };
type LivesProps = { lives: number; play: (file: string, volume: number) => void };
type CommentCardProps = { comment: Comment; revealed: boolean };
type GameButtonProps = { action: Action; disabled: boolean; play: (file: string, volume: number) => void };
type Particle = { id: string; color: string; left: number; size: number; duration: number; delay: number };
