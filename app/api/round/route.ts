import { NextResponse } from "next/server";

type Comment = {
  profilePicture: string;
  username: string;
  comment: string;
  likes: number;
  date: string;
  isReal: boolean;
  videoName?: string;
  video?: string;
};

type Source = "ai" | "real";
type Difficulty = "easy" | "hard";

type YouTubeVideo = {
  id: string;
  snippet: { title: string };
};

const MAX_COMMENT_LENGTH = 240;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const source: Source | null = body?.source === "ai" || body?.source === "real" ? body.source : null;
  const difficulty: Difficulty = body?.difficulty === "hard" ? "hard" : "easy";
  const count = body?.count;

  if (!source || !Number.isInteger(count) || count < 1 || count > 10) {
    return NextResponse.json({ error: "Choose a valid comment source and count." }, { status: 400 });
  }

  if (!process.env.YOUTUBE_API_KEY || !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "The local YouTube or OpenAI key is missing." }, { status: 500 });
  }

  try {
    const comments = source === "real"
      ? await getYouTubeComments(count)
      : await getAiComments(count, difficulty);

    return NextResponse.json({ comments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The comment service failed.";
    console.error(`[api/round] ${source} comments failed: ${message}`);
    return NextResponse.json({ error: message }, { status: error instanceof RoundApiError ? error.status : 502 });
  }
}

async function getYouTubeComments(count: number): Promise<Comment[]> {
  const videos = await getPopularVideos();
  const comments: Comment[] = [];

  for (const video of shuffle(videos)) {
    const comment = await getCommentFromVideo(video);
    if (comment) comments.push(comment);
    if (comments.length === count) return comments;
  }

  throw new Error("YouTube did not return enough eligible comments. Try again.");
}

async function getAiComments(count: number, difficulty: Difficulty): Promise<Comment[]> {
  const sourceComments = await getYouTubeComments(count);
  return Promise.all(sourceComments.map((comment) => createAiComment(comment, difficulty)));
}

async function getPopularVideos(): Promise<YouTubeVideo[]> {
  const response = await fetch("https://www.googleapis.com/youtube/v3/videos?part=id%2Csnippet&chart=mostPopular&regionCode=US&maxResults=100", {
    headers: { "X-goog-api-key": process.env.YOUTUBE_API_KEY! },
    cache: "no-store",
  });

  if (!response.ok) throw new RoundApiError(response.status, "YouTube could not load popular videos. Check YOUTUBE_API_KEY.");

  const payload = await response.json() as { items?: YouTubeVideo[] };
  if (!payload.items?.length) throw new Error("YouTube did not return any popular videos.");
  return payload.items;
}

async function getCommentFromVideo(video: YouTubeVideo): Promise<Comment | null> {
  const params = new URLSearchParams({ part: "snippet", videoId: video.id, maxResults: "50" });
  const response = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?${params}`, {
    headers: { "X-goog-api-key": process.env.YOUTUBE_API_KEY! },
    cache: "no-store",
  });

  if (response.status === 429) throw new RoundApiError(429, "YouTube is temporarily rate limiting requests.");
  if (!response.ok) return null;

  const payload = await response.json() as { items?: Array<{ snippet?: { topLevelComment?: { snippet?: YouTubeCommentSnippet } } }> };
  const candidates = payload.items
    ?.map((item) => item.snippet?.topLevelComment?.snippet)
    .filter((comment): comment is YouTubeCommentSnippet => Boolean(comment && toPlainText(comment.textDisplay).length <= MAX_COMMENT_LENGTH));

  if (!candidates?.length) return null;

  const comment = candidates[Math.floor(Math.random() * candidates.length)];
  return {
    profilePicture: comment.authorProfileImageUrl,
    username: comment.authorDisplayName.replace(/^@/, ""),
    comment: toPlainText(comment.textDisplay),
    likes: comment.likeCount,
    date: comment.publishedAt.slice(0, 10),
    isReal: true,
    videoName: video.snippet.title,
    video: `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`,
  };
}

async function createAiComment(source: Comment, difficulty: Difficulty): Promise<Comment> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.6-luna",
      store: false,
      max_output_tokens: 256,
      reasoning: { effort: "none" },
      instructions: difficulty === "hard" ? hardCommentInstructions : easyCommentInstructions,
      input: `Video title: ${source.videoName}\nA real comment for style only: ${source.comment}`,
      text: {
        format: {
          type: "json_schema",
          name: "youtube_comment",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              username: { type: "string" },
              comment: { type: "string" },
            },
            required: ["username", "comment"],
          },
        },
      },
    }),
  });

  if (!response.ok) throw new RoundApiError(response.status, "OpenAI could not generate a comment. Check OPENAI_API_KEY and available credits.");

  const payload = await response.json() as OpenAiResponse;
  const content = getOutputText(payload);
  const generated = JSON.parse(content) as { username?: unknown; comment?: unknown };

  if (typeof generated.username !== "string" || typeof generated.comment !== "string") {
    throw new Error("OpenAI returned an incomplete comment.");
  }

  const comment = toPlainText(generated.comment);
  if (!comment || comment.length > MAX_COMMENT_LENGTH) throw new Error("OpenAI returned an invalid comment.");

  return { ...source, username: generated.username.trim(), comment, isReal: false };
}

function getOutputText(payload: OpenAiResponse): string {
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text) return content.text;
    }
  }

  throw new Error("OpenAI did not return a comment.");
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function toPlainText(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

type YouTubeCommentSnippet = {
  authorDisplayName: string;
  authorProfileImageUrl: string;
  textDisplay: string;
  likeCount: number;
  publishedAt: string;
};

type OpenAiResponse = {
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
};

class RoundApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

const easyCommentInstructions = "Create an original, believable YouTube comment for a guessing game. Keep it under 240 characters. Do not use hateful, sexual, or personally identifying content.";

const hardCommentInstructions = `Create an original fake YouTube comment for a difficult guessing game. Keep it under the source comment's length, usually about half as long, with at most two sentences. Match the video and source comment's context, but do not copy it. Write like an imperfect casual YouTube user: use minor grammar mistakes or typos, but never missing letters. Do not use commas, apostrophes, or a final period. Never use um, uh, ugh, dat, gr8, luv, dhat, enuf, meen, vidz, dis, text-message substitutions like r/y/n/d, hashtags, or start with Wow, Omg, Oh, Yeah, or Yo. If the tone is negative or bored, use one short sentence. Pick one distinct persona: confused child, slangy child, troll, angry viewer, incoherent viewer, enthusiastic fan, casual viewer, ranter, fan critic, happy viewer, likes bait, joke stealer, stretched-vowel fan, emoji-only user, shipper, request kid, quoter, all-caps timestamp poster, proud country fan, laugher, or verbose yapper. Add only natural contextual slang. Do not use hateful, sexual, or personally identifying content.`;
