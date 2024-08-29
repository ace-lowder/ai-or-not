import { createContext, useContext, useState } from 'react';
import { realComments } from '../data/realComments'; // Importing hard-coded real comments
import profileTest from '../assets/profile-test.png'; // Default profile picture

// prettier-ignore
export interface Comment {
  profilePicture: string;  // URL to the profile picture
  username: string;        // The username of the commenter
  comment: string;         // The actual comment text
  likes: number;           // Number of likes the comment has received
  date: string;            // Date the comment was posted
  isReal: boolean;         // Indicates whether the comment is real or AI-generated
  videoName?: string;      // Optional name of the video the comment was left on
  video?: string;          // Optional URL or title of the video the comment was left on
}

interface CommentContextType {
  fetchedComment: Comment | undefined;
  fetchComment: () => void;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

// Function to validate the profile picture using an Image element
const validateProfilePicture = (
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

const CommentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [youtubeCache, setYoutubeCache] = useState<Comment[]>([]); // Updated type to Comment[]
  const [aiCache, setAiCache] = useState<Comment[]>([]); // Updated type to Comment[]
  const [fetchedComment, setFetchedComment] = useState<Comment | undefined>(
    undefined,
  );

  const fetchComment = async () => {
    let comment: Comment;

    if (Math.random() > 0.5) {
      // Attempt to fetch a real comment from the cache
      if (youtubeCache.length > 0) {
        comment = youtubeCache.shift()!; // Use comment from YouTube cache
      } else if (realComments.length > 0) {
        comment = realComments[Math.floor(Math.random() * realComments.length)]; // Fallback to hard-coded real comments

        // Validate the profile picture URL using an Image element
        const validatedProfilePicture = await validateProfilePicture(
          comment.profilePicture,
          comment.username,
        );
        comment.profilePicture = validatedProfilePicture;
      } else {
        // If both caches are empty, fallback to a default real comment (if needed)
        comment = {
          profilePicture: profileTest,
          username: 'Default User',
          comment: 'Default real comment.',
          likes: 0,
          date: new Date().toISOString(),
          isReal: true,
          videoName: 'Default Video',
          video: 'https://example.com/default-video-thumbnail.jpg',
        };
      }
    } else {
      // Fetch an AI-generated comment from the cache
      if (aiCache.length > 0) {
        comment = aiCache.shift()!; // Use comment from AI cache
      } else {
        // Fallback to default AI comment
        comment = {
          profilePicture: profileTest,
          username: 'AI ChatBot',
          comment: 'This is an AI test comment.',
          likes: 10,
          date: '2024-08-23',
          isReal: false,
          videoName: undefined,
          video: undefined,
        };
      }
    }

    setFetchedComment(comment);
  };

  return (
    <CommentContext.Provider value={{ fetchedComment, fetchComment }}>
      {children}
    </CommentContext.Provider>
  );
};

const useComment = () => {
  const context = useContext(CommentContext);
  if (!context)
    throw new Error('useComment must be used within a CommentProvider');
  return context;
};

export { CommentProvider, useComment };
