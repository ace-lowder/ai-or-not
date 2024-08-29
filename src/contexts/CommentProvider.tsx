import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { realComments } from '../data/realComments'; // Importing hard-coded real comments
import profileTest from '../assets/profile-test.png'; // Default profile picture
import {
  decodeHtmlEntities,
  getYoutubeComments,
} from '../services/youtubeService'; // Importing helper function

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
  const [youtubeCache, setYoutubeCache] = useState<Comment[]>([]);
  const [aiCache, setAiCache] = useState<Comment[]>([]);
  const [fetchedComment, setFetchedComment] = useState<Comment | undefined>(
    undefined,
  );

  const didMount = useRef(false);
  const isFetching = useRef(true);

  // Check local storage on mount
  useEffect(() => {
    const storedYoutubeCache = localStorage.getItem('youtubeCache');
    const storedAiCache = localStorage.getItem('aiCache');

    if (storedYoutubeCache) {
      setYoutubeCache(JSON.parse(storedYoutubeCache));
    } else {
      getYoutubeComments().then(comments => {
        setYoutubeCache(prevCache => {
          const updatedCache = [...prevCache, ...comments];
          localStorage.setItem('youtubeCache', JSON.stringify(updatedCache)); // Update local storage
          return updatedCache;
        });
      });
    }

    if (storedAiCache) {
      setAiCache(JSON.parse(storedAiCache));
    } else {
      localStorage.setItem('aiCache', JSON.stringify(aiCache));
    }

    setTimeout(() => {
      didMount.current = true;
      isFetching.current = false;
    }, 2000);
  }, []);

  // Update local storage whenever youtubeCache or aiCache changes
  useEffect(() => {
    if (didMount.current) {
      localStorage.setItem('youtubeCache', JSON.stringify(youtubeCache));
      localStorage.setItem('aiCache', JSON.stringify(aiCache));
    }
  }, [youtubeCache, aiCache]);

  useEffect(() => {
    // Avoid fetching if youtubeCache is sufficient
    if (youtubeCache.length > 5 || isFetching.current) {
      return;
    }

    // Set fetching flag before starting to fetch
    isFetching.current = true;

    // Fetch comments
    getYoutubeComments().then(comments => {
      setYoutubeCache(prevCache => {
        // If the previous cache is still sufficient, no need to add more comments
        if (prevCache.length > 5) {
          isFetching.current = false;
          return prevCache;
        }

        const updatedCache = [...prevCache, ...comments];
        localStorage.setItem('youtubeCache', JSON.stringify(updatedCache)); // Update local storage
        isFetching.current = false;
        return updatedCache;
      });
    });
  }, [youtubeCache]); // Watching youtubeCache for changes

  const fetchComment = async () => {
    let comment: Comment;

    if (Math.random() > 0.5) {
      if (youtubeCache.length > 0) {
        comment = youtubeCache.shift()!;
        setYoutubeCache([...youtubeCache]); // Update the state with shifted cache
        localStorage.setItem('youtubeCache', JSON.stringify(youtubeCache)); // Update local storage
      } else {
        comment = realComments[Math.floor(Math.random() * realComments.length)];
      }

      comment.comment = decodeHtmlEntities(comment.comment);
    } else {
      if (aiCache.length > 0) {
        comment = aiCache.shift()!;
        setAiCache([...aiCache]); // Update the state with shifted cache
        localStorage.setItem('aiCache', JSON.stringify(aiCache)); // Update local storage
      } else {
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
