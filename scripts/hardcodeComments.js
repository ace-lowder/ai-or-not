import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Retrieve the YouTube API key and OpenAI API key from the environment variables
const API_KEY = process.env.VITE_YOUTUBE_API || '';
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || '';

// Function to get the top popular video ID along with video name and thumbnail
const getTopPopularVideo = async () => {
  try {
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'id,snippet',
          chart: 'mostPopular',
          regionCode: 'US',
          maxResults: 1, // Fetch only 1 video to limit API calls initially
          key: API_KEY,
        },
      },
    );

    const video = response.data.items[0]; // Get the first video
    return {
      id: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.medium.url, // Use medium-sized thumbnail
    };
  } catch (error) {
    console.error('Error fetching video ID:', error.message);
    return null;
  }
};

// Function to fetch comments from a specific video
const fetchCommentsFromVideo = async (videoId, videoName, videoThumbnail) => {
  try {
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/commentThreads',
      {
        params: {
          part: 'snippet',
          videoId: videoId,
          maxResults: 10, // Fetch 10 comments to pick 5 real and 5 for generating fake comments
          key: API_KEY,
        },
      },
    );

    const comments = response.data.items.map(item => ({
      profilePicture:
        item.snippet.topLevelComment.snippet.authorProfileImageUrl,
      username: item.snippet.topLevelComment.snippet.authorDisplayName.replace(
        /^@/,
        '',
      ), // Remove @ symbol from username
      comment: item.snippet.topLevelComment.snippet.textDisplay,
      likes: item.snippet.topLevelComment.snippet.likeCount,
      date: item.snippet.topLevelComment.snippet.publishedAt.split('T')[0], // Only keep the date part
      isReal: true,
      videoName: videoName, // Use the actual video name
      video: videoThumbnail, // Use the medium-sized video thumbnail URL
    }));

    return comments;
  } catch (error) {
    console.error(
      `Error fetching comments for video ID ${videoId}:`,
      error.message,
    );
    return [];
  }
};

// Function to generate a fake username using OpenAI's API
const generateFakeUsername = async realUsername => {
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

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating fake username:', error.message);
    return 'FakeUser123'; // Fallback username
  }
};

// Function to generate a more creative fake comment using OpenAI's API
const generateFakeCommentText = async (realComment, videoTitle) => {
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
        temperature: 0.9, // Increase temperature for more creativity
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      },
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating fake comment:', error.message);
    return 'Wow, I never thought of it like that! Great video!'; // Fallback comment
  }
};

// Function to generate a fake AI comment
const generateFakeComment = async realComment => {
  const fakeUsername = await generateFakeUsername(realComment.username);
  const fakeCommentText = await generateFakeCommentText(
    realComment.comment,
    realComment.videoName,
  );

  return {
    profilePicture: realComment.profilePicture, // Use the same profile picture
    username: fakeUsername,
    comment: fakeCommentText,
    likes: realComment.likes,
    date: realComment.date,
    isReal: false,
    videoName: realComment.videoName,
    video: realComment.video,
  };
};

// Function to fetch and process comments
const fetchAndProcessComments = async () => {
  const video = await getTopPopularVideo();
  if (video) {
    const comments = await fetchCommentsFromVideo(
      video.id,
      video.title,
      video.thumbnail,
    );

    if (comments.length) {
      // Pick 5 real comments
      const realComments = comments.slice(0, 5);

      // Generate 5 fake comments based on the next 5 real comments
      const fakeComments = await Promise.all(
        comments
          .slice(5, 10)
          .map(realComment => generateFakeComment(realComment)),
      );

      // Save real comments
      const realCommentsPath = path.resolve(
        process.cwd(),
        'src/data/realComments.ts',
      );
      const realCommentsContent = `export const realComments = ${JSON.stringify(
        realComments,
        null,
        2,
      )};`;
      fs.writeFileSync(realCommentsPath, realCommentsContent, 'utf-8');

      // Save fake comments
      const fakeCommentsPath = path.resolve(
        process.cwd(),
        'src/data/fakeComments.ts',
      );
      const fakeCommentsContent = `export const fakeComments = ${JSON.stringify(
        fakeComments,
        null,
        2,
      )};`;
      fs.writeFileSync(fakeCommentsPath, fakeCommentsContent, 'utf-8');

      console.log(
        'Comments have been saved to src/data/realComments.ts and src/data/fakeComments.ts',
      );
    }
  }
};

// Start the process
fetchAndProcessComments();
