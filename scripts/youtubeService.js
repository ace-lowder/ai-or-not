import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Retrieve the YouTube API key from the environment variables
const API_KEY = process.env.YOUTUBE_API || '';

// Log the API key to verify it's being read correctly
console.log('Using YouTube API Key:', API_KEY);

// Function to get the top popular video IDs along with video names and thumbnails
const getTopPopularVideos = async () => {
  try {
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'id,snippet',
          chart: 'mostPopular',
          regionCode: 'US',
          maxResults: 5,
          key: API_KEY,
        },
      },
    );

    const videos = response.data.items.map(video => ({
      id: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.medium.url, // Use medium-sized thumbnail
    }));
    console.log('Fetched videos:', videos);
    return videos;
  } catch (error) {
    console.error('Error fetching video IDs:', error.message);
    return [];
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
          maxResults: 5, // Number of comments to fetch
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

    console.log(`Comments for video ID ${videoId}:`, comments);
    return comments;
  } catch (error) {
    console.error(
      `Error fetching comments for video ID ${videoId}:`,
      error.message,
    );
    return [];
  }
};

// Function to fetch and save comments to a TypeScript file
const fetchAndSaveComments = async () => {
  const videos = await getTopPopularVideos();
  let allComments = [];

  for (const video of videos) {
    const comments = await fetchCommentsFromVideo(
      video.id,
      video.title,
      video.thumbnail,
    );
    allComments = [...allComments, ...comments];
  }

  // Write the fetched comments to a TypeScript file
  const filePath = path.resolve(process.cwd(), 'src/data/realComments.ts');
  const fileContent = `export const realComments = ${JSON.stringify(
    allComments,
    null,
    2,
  )};`;

  fs.writeFileSync(filePath, fileContent, 'utf-8');
  console.log('Comments have been saved to src/data/realComments.ts');
};

// Start the fetching process
fetchAndSaveComments();
