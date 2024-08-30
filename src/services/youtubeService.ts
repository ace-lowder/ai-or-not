import axios from 'axios';
import { Comment } from '../contexts/CommentProvider';

const API_KEY = import.meta.env.VITE_YOUTUBE_API;

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

export const validateProfilePicture = (
  url: string,
  username: string,
): Promise<string> => {
  return new Promise(resolve => {
    const img = new Image();
    img.src = url;

    img.onload = () => {
      resolve(url);
    };

    img.onerror = () => {
      resolve(
        `https://ui-avatars.com/api/?color=ffffff&name=${encodeURIComponent(
          username,
        )}&background=random&length=1`,
      );
    };
  });
};

export const decodeHtmlEntities = (text: string): string => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

export const getTopPopularVideos = async (): Promise<VideoItem[]> => {
  const cacheKey = 'youtubeVideoItems';
  const cacheDateKey = 'youtubeVideoItemsDate';
  const today = new Date().toISOString().split('T')[0];

  const cachedVideoItems = localStorage.getItem(cacheKey);
  const cachedDate = localStorage.getItem(cacheDateKey);

  if (cachedVideoItems && cachedDate === today) {
    return JSON.parse(cachedVideoItems);
  }

  try {
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'id,snippet',
          chart: 'mostPopular',
          regionCode: 'US',
          maxResults: 100,
          key: API_KEY,
        },
      },
    );

    const videoItems = response.data.items.map((video: VideoItem) => ({
      id: video.id,
      snippet: video.snippet,
    }));

    localStorage.setItem(cacheKey, JSON.stringify(videoItems));
    localStorage.setItem(cacheDateKey, today);

    return videoItems;
  } catch (error) {
    // console.error('Error fetching top popular video items:', error);
    return [];
  }
};

export const fetchCommentFromVideo = async (
  videoId: string,
  videoTitle: string,
): Promise<Comment | null> => {
  try {
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/commentThreads',
      {
        params: {
          part: 'snippet',
          videoId: videoId,
          maxResults: 50,
          key: API_KEY,
        },
      },
    );

    const items = response.data.items;

    if (items.length === 0) {
      return null;
    }

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
      date: item.snippet.topLevelComment.snippet.publishedAt.split('T')[0],
      isReal: true,
      videoName: videoTitle,
      video: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    };

    return comment;
  } catch (error) {
    // console.error(`Error fetching comment for video ID ${videoId}:`, error);
    return null;
  }
};

export const getYoutubeComments = async (): Promise<Comment[]> => {
  const videoItems = await getTopPopularVideos();
  const selectedVideos = videoItems
    .sort(() => 0.5 - Math.random())
    .slice(0, 10); // Randomly pick 10 videos
  const comments: Comment[] = [];

  for (const video of selectedVideos) {
    const comment = await fetchCommentFromVideo(video.id, video.snippet.title);

    if (comment && comment.comment.length <= 240) {
      comments.push(comment);
    }

    if (comments.length === 10) {
      break;
    }
  }

  return comments;
};
