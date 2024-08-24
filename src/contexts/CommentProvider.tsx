import { createContext, useContext, useEffect, useState } from 'react';
import profileTest from '../assets/profile-test.png';
import profileAI from '../assets/profile-ai.png';

// prettier-ignore
export interface Comment {
  profilePicture: string;  // URL to the profile picture
  username: string;        // The username of the commenter
  comment: string;         // The actual comment text
  likes: number;           // Number of likes the comment has received
  date: string;            // Date the comment was posted
  video?: string;          // Optional URL or title of the video the comment was left on
  isReal: boolean;         // Indicates whether the comment is real or AI-generated
}

interface CommentContextType {
  fetchedComment: Comment | undefined;
  getRandomComment: () => void;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

const CommentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fetchedComment, setFetchedComment] = useState<Comment | undefined>(
    undefined,
  );

  const getRandomComment = () => {
    const randomComment =
      Math.random() > 0.5
        ? {
            profilePicture: profileTest,
            username: 'Test User',
            comment: 'This is a real test comment.',
            likes: 10,
            date: '2024-08-23',
            video: 'Test Video',
            isReal: true,
          }
        : {
            profilePicture: profileAI,
            username: 'AI ChatBot',
            comment: 'This is an AI test comment.',
            likes: 10,
            date: '2024-08-23',
            video: undefined,
            isReal: false,
          };

    setFetchedComment(randomComment);
  };

  return (
    <CommentContext.Provider value={{ fetchedComment, getRandomComment }}>
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
