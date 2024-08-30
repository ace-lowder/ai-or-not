import axios from 'axios';
import { Comment } from '../contexts/CommentProvider';
import { getYoutubeComments } from './youtubeService';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const generateFakeUsername = async (realUsername: string): Promise<string> => {
  const prompt = `Generate a YouTube username similar in length, tone, and style to the following username: "${realUsername}". Make the username original but keep it convincing as if it belongs to a real person. In your response, say the username only. No quotes around the username, no special characters.`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that generates fake usernames based on provided context.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 10,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      },
    );

    const username = response.data.choices[0].message.content.trim();
    return username;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error generating fake username:', error.message);
    } else {
      console.error('Error generating fake username:', error);
    }
    return 'FakeUser123';
  }
};

const generateFakeCommentText = async (
  realComment: string,
  videoTitle: string,
): Promise<string> => {
  const basePrompt = `Based on the video titled "${videoTitle}" and the real comment: "${realComment}", write an original YouTube comment that:
    - Is not longer than the original comment.
    - Aim for half its length in characters. 2 sentences max.
    - Uses casual grammar, mostly lowercase, and very minor typos.
    - DO NOT USE COMMAS OR APOSTRAPHES. NO PERIODS AT THE END OF COMMENTS
    - 1 letter missing max per word. 3 letters missing max per comment.
    - If negative or bored, keep it very short and limit to 1 sentence.
    - Avoid hashtags. If using slang, ensure it fits the context.
    - No 'um' or 'uh'. If you have more than one sentence and the last sentence is short, remove it.`;

  const personas = [
    "Persona: Confused child. Simple words, bad grammar, no caps, some typos, e.g., 'i dnt get it why'.",
    "Persona: Child using slang. Emotional, bad grammar, lowercase, e.g., 'dat was lit frfr'.",
    "Persona: Troll. Short, mocking, e.g., 'ur video is a joke'.",
    "Persona: Sarcastic. Short, dry, e.g., 'yeah sure'.",
    "Persona: Angry. Frustrated, short, e.g., 'u stupid like why the hell idiot'.",
    "Persona: Incoherent. Broken English, typos, e.g., 'very good me like'.",
    "Persona: Nostalgic. References past briefly, e.g., 'born in the wrong year'.",
    "Persona: Enthusiastic fan. Excited, use emojis, e.g., 'wow 😂😂!! '.",
    "Persona: Casual viewer. Polite, short, e.g., 'good vid'.",
    "Persona: Ranter. Off-topic rant, short, e.g., 'honestly should be put in jail'.",
    "Persona: Critical. Focus on flaws, short, e.g., 'why so bad editing @1:03'.",
    "Persona: Fan critic. Positive then critical, e.g., 'love u but this aint it'.",
    "Persona: Shy. Hesitant, e.g., 'ok'.",
    "Persona: Pessimist. Negative, e.g., 'nothing changes'.",
    "Persona: Happy-go-lucky. Positive, e.g., 'Made my day!!'.",
    "Persona: Stressed. Overwhelmed, e.g., 'cant deal rn'.",
    "Persona: Trendy. Posts for likes, e.g., 'Like if born in the wrong generation'.",
    "Persona: Stolen Jokes. Generic stolen jokes, e.g., 'we gettin out the classroom with this one 🔥'.",
  ];

  const selectedPersona = personas[Math.floor(Math.random() * personas.length)];
  const fullPrompt = `${basePrompt} ${selectedPersona}`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that generates original and creative fake YouTube comments based on provided context.',
          },
          { role: 'user', content: fullPrompt },
        ],
        max_tokens: 50,
        temperature: 0.9,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      },
    );

    const commentText = response.data.choices[0].message.content.trim();
    return commentText;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error generating fake comment:', error.message);
    } else {
      console.error('Error generating fake comment:', error);
    }
    return 'Wow, I never thought of it like that! Great video!';
  }
};

const generateFakeComment = async (realComment: Comment): Promise<Comment> => {
  const fakeUsername = await generateFakeUsername(realComment.username);
  const fakeCommentText = await generateFakeCommentText(
    realComment.comment,
    realComment.videoName || '',
  );

  return {
    profilePicture: realComment.profilePicture,
    username: fakeUsername,
    comment: fakeCommentText,
    likes: realComment.likes,
    date: realComment.date,
    isReal: false,
    videoName: realComment.videoName,
    video: realComment.video,
  };
};

export const getGeneratedComments = async (): Promise<Comment[]> => {
  const realComments = await getYoutubeComments();
  const generatedComments: Comment[] = [];

  for (const realComment of realComments) {
    const fakeComment = await generateFakeComment(realComment);
    generatedComments.push(fakeComment);

    if (generatedComments.length === 10) {
      break;
    }
  }

  return generatedComments;
};
