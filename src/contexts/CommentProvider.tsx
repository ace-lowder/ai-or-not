import { createContext, useContext, useState } from 'react';
import profileTest from '../assets/profile-test.png';
import profileAI from '../assets/profile-ai.png';

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

const CommentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fetchedComment, setFetchedComment] = useState<Comment | undefined>(
    undefined,
  );

  const fetchComment = () => {
    const randomComment =
      Math.random() > 0.5
        ? {
            profilePicture: profileTest,
            username: 'Test User',
            comment: 'This is a real test comment.',
            likes: 10,
            date: '2024-08-23',
            isReal: true,
            videoName: 'This is a Long Title for a Test Video',
            video: 'https://i3.ytimg.com/vi/DxRwBUnEA_I/maxresdefault.jpg',
          }
        : {
            profilePicture: profileAI,
            username: 'AI ChatBot',
            comment: 'This is an AI test comment.',
            likes: 10,
            date: '2024-08-23',
            isReal: false,
            videoName: undefined,
            video: undefined,
          };

    setFetchedComment(randomComment);
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
