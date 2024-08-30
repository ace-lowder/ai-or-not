import axios from 'axios';
import { Comment } from '../contexts/CommentProvider';

// Use Vite's `import.meta.env` to access environment variables
const API_KEY = import.meta.env.VITE_YOUTUBE_API;

// TypeScript type for YouTube API video items
interface VideoItem {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

// Function to validate the profile picture using an Image element
export const validateProfilePicture = (
  url: string,
  username: string,
): Promise<string> => {
  return new Promise(resolve => {
    const img = new Image();
    img.src = url;

    img.onload = () => {
      resolve(url); // Image loaded successfully
    };

    img.onerror = () => {
      // Use UI avatar if image fails to load
      resolve(
        `https://ui-avatars.com/api/?color=ffffff&name=${encodeURIComponent(
          username,
        )}&background=random&length=1`,
      );
    };
  });
};

// Utility function to decode HTML entities
export const decodeHtmlEntities = (text: string): string => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

// Function to get the top 30 popular video IDs and their titles
export const getTopPopularVideos = async (): Promise<VideoItem[]> => {
  const cacheKey = 'youtubeVideoItems';
  const cacheDateKey = 'youtubeVideoItemsDate';
  const today = new Date().toISOString().split('T')[0];

  // Check if we have cached video items and if they are from today
  const cachedVideoItems = localStorage.getItem(cacheKey);
  const cachedDate = localStorage.getItem(cacheDateKey);

  if (cachedVideoItems && cachedDate === today) {
    return JSON.parse(cachedVideoItems);
  }

  // If not cached or outdated, fetch new data
  try {
    console.error('[API CALL] Fetching Top Videos');
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'id,snippet',
          chart: 'mostPopular',
          regionCode: 'US',
          maxResults: 30,
          key: API_KEY,
        },
      },
    );

    const videoItems = response.data.items.map((video: VideoItem) => ({
      id: video.id,
      snippet: video.snippet,
    }));

    // Store fetched video items in local storage with the current date
    localStorage.setItem(cacheKey, JSON.stringify(videoItems));
    localStorage.setItem(cacheDateKey, today);

    return videoItems;
  } catch (error) {
    console.error('Error fetching top popular video items:', error);
    return [];
  }
};

// Function to fetch a random comment from a specific video
export const fetchCommentFromVideo = async (
  videoId: string,
  videoTitle: string,
): Promise<Comment | null> => {
  try {
    console.error('[API CALL] Fetching Comments');

    // Fetch a larger set of comments (up to 100)
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/commentThreads',
      {
        params: {
          part: 'snippet',
          videoId: videoId,
          maxResults: 20, // Fetching more comments to increase randomness
          key: API_KEY,
        },
      },
    );

    const items = response.data.items;

    if (items.length === 0) {
      return null; // No comments found
    }

    // Select a random comment from the fetched list
    const randomIndex = Math.floor(Math.random() * items.length);
    const item = items[randomIndex];

    const comment: Comment = {
      profilePicture:
        item.snippet.topLevelComment.snippet.authorProfileImageUrl,
      username: item.snippet.topLevelComment.snippet.authorDisplayName.replace(
        /^@/,
        '',
      ),
      comment: decodeHtmlEntities(
        item.snippet.topLevelComment.snippet.textDisplay,
      ),
      likes: item.snippet.topLevelComment.snippet.likeCount,
      date: item.snippet.topLevelComment.snippet.publishedAt.split('T')[0], // Format date
      isReal: true,
      videoName: videoTitle, // Use the actual video title
      video: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`, // Use thumbnail URL
    };

    return comment;
  } catch (error) {
    console.error(`Error fetching comment for video ID ${videoId}:`, error);
    return null;
  }
};

// Function to get 10 random comments from 10 different videos
export const getYoutubeComments = async (): Promise<Comment[]> => {
  const videoItems = await getTopPopularVideos();
  const selectedVideos = videoItems
    .sort(() => 0.5 - Math.random())
    .slice(0, 10); // Randomly pick 10 videos
  const comments: Comment[] = [];

  for (const video of selectedVideos) {
    const comment = await fetchCommentFromVideo(video.id, video.snippet.title);
    if (comment) {
      comments.push(comment);
    }

    // Break early if we already have 10 comments
    if (comments.length === 10) {
      break;
    }
  }

  return comments;
};
