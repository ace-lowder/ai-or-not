import { useEffect } from 'react';
import { useComment } from '../contexts/CommentProvider';

const CommentDisplay: React.FC = () => {
  const { fetchedComment, getRandomComment } = useComment();

  useEffect(() => {
    getRandomComment();
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white rounded shadow-lg p-4 text-gray-900 z-20">
      <div className="flex items-center mb-2">
        <img
          src={fetchedComment?.profilePicture}
          alt="Profile"
          className="w-8 h-8 rounded-full mr-2"
        />
        <div className="font-semibold">{fetchedComment?.username}</div>
      </div>
      <div className="text-sm mb-2">{fetchedComment?.comment}</div>
      <div className="text-xs text-gray-500">
        {fetchedComment?.date} • {fetchedComment?.likes} likes
      </div>
    </div>
  );
};

export default CommentDisplay;
