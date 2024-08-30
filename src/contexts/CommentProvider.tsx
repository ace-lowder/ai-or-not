import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { realComments } from '../data/realComments';
import { fakeComments } from '../data/fakeComments';
import {
  decodeHtmlEntities,
  getYoutubeComments,
} from '../services/youtubeService';
import { getGeneratedComments } from '../services/openaiService';

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
  const isFetchingYoutube = useRef(true);
  const isFetchingAi = useRef(true);

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
          localStorage.setItem('youtubeCache', JSON.stringify(updatedCache));
          return updatedCache;
        });
      });
    }

    if (storedAiCache) {
      setAiCache(JSON.parse(storedAiCache));
    } else {
      getGeneratedComments().then(comments => {
        setAiCache(prevCache => {
          const updatedCache = [...prevCache, ...comments];
          localStorage.setItem('aiCache', JSON.stringify(updatedCache));
          return updatedCache;
        });
      });
    }

    setTimeout(() => {
      didMount.current = true;
      isFetchingYoutube.current = false;
      isFetchingAi.current = false;
    }, 2000);
  }, []);

  useEffect(() => {
    if (didMount.current) {
      localStorage.setItem('youtubeCache', JSON.stringify(youtubeCache));
      localStorage.setItem('aiCache', JSON.stringify(aiCache));
    }
  }, [youtubeCache, aiCache]);

  useEffect(() => {
    if (youtubeCache.length > 5 || isFetchingYoutube.current) {
      return;
    }

    isFetchingYoutube.current = true;

    getYoutubeComments().then(comments => {
      setYoutubeCache(prevCache => {
        if (prevCache.length > 5) {
          isFetchingYoutube.current = false;
          return prevCache;
        }

        const updatedCache = [...prevCache, ...comments];
        localStorage.setItem('youtubeCache', JSON.stringify(updatedCache));
        isFetchingYoutube.current = false;
        return updatedCache;
      });
    });
  }, [youtubeCache]);

  useEffect(() => {
    if (aiCache.length > 5 || isFetchingYoutube.current) {
      return;
    }

    isFetchingAi.current = true;

    getGeneratedComments().then(comments => {
      setAiCache(prevCache => {
        if (prevCache.length > 5) {
          isFetchingYoutube.current = false;
          return prevCache;
        }

        const updatedCache = [...prevCache, ...comments];
        localStorage.setItem('aiCache', JSON.stringify(updatedCache));
        isFetchingYoutube.current = false;
        return updatedCache;
      });
    });
  }, [aiCache]);

  const fetchComment = async () => {
    let comment: Comment;

    if (Math.random() > 0.5) {
      if (youtubeCache.length > 0) {
        console.log('[Real]');
        comment = youtubeCache.shift()!;
        setYoutubeCache([...youtubeCache]);
        localStorage.setItem('youtubeCache', JSON.stringify(youtubeCache));
      } else {
        console.log('[Real Hardcoded]');
        comment = realComments[Math.floor(Math.random() * realComments.length)];
      }

      comment.comment = decodeHtmlEntities(comment.comment);
    } else {
      if (aiCache.length > 0) {
        console.log('[Fake]');
        comment = aiCache.shift()!;
        setAiCache([...aiCache]);
        localStorage.setItem('aiCache', JSON.stringify(aiCache));
      } else {
        console.log('[Fake Hardcoded]');
        comment = fakeComments[Math.floor(Math.random() * fakeComments.length)];
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
