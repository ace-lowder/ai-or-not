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
  const basePrompt = `Based on the video titled "${videoTitle}" and the real comment: "${realComment}", write an original YouTube comment with these rules:
    - Not longer than the real comment
    - Half its length in characters. 2 sentences max
    - Has casual grammar and very minor typos
    - Mostly lowercase (Only capitalize the first letter of the first word)
    - DO NOT USE COMMAS OR APOSTRAPHES
    - DO NOT USE PERIODS AT THE END OF COMMENTS
    - 1 letter missing max per word. 3 letters missing max per comment
    - If negative or bored, keep it very short and limit to 1 sentence
    - Avoid hashtags
    - If using slang, ensure it fits the context
    - No 'um' or 'uh'.
    - If you have more than one sentence and the last sentence is short, remove it
    - Follow these rules exactly, unless the persona you get says otherwise
    
    Here is your Persona: `;

  const personas = [
    "Confused child. Simple words, bad grammar, no caps, some typos, e.g., 'i dnt get it why'",
    "Child using slang. Emotional, bad grammar, e.g., 'Dat was lit frfr. stop cappin'",
    "Troll. Short, mocking, e.g., 'Ur video is bad'",
    "Angry. Frustrated, short, e.g., 'u stupid like why the hell idiot'",
    "Incoherent. Broken English, typos, e.g., 'Very good me like'",
    "Enthusiastic fan. Excited, use emojis, include timestamp, e.g., 'Wow 7:24 😂😂!! '",
    "Casual viewer. Polite, short, e.g., 'Good vid'",
    "Ranter. Off-topic rant, short, e.g., 'Honestly should be put in jail'",
    "Fan critic. Positive then critical, e.g., 'Love u but this aint it'",
    "Happy-go-lucky. Positive, e.g., 'Made my day!!'",
    "Trendy. Posts for likes, e.g., 'Like if you were born in the wrong generation' or 'Like if your watching this in 2024'",
    "Stolen Jokes. Generic stolen jokes, e.g., 'We gettin out the hood with this one 🔥🔥🔥'",
    "Long words. Multiple vowels together or letters at the end, e.g., 'whaaaaaat was thatttttttt'",
    "Emojis. Just emojis, nothing else e.g., '💃💃💃💃💃💃'",
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
