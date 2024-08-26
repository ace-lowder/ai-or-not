interface Comment {
  profilePicture: string;
  username: string;
  comment: string;
  likes: number;
  date: string;
}

interface CommentCardProps {
  comment: Comment;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  return (
    <div className="max-w-md bg-white rounded shadow-lg p-4 text-gray-900">
      <div className="flex items-center mb-2">
        <img
          src={comment.profilePicture}
          alt="Profile"
          className="w-8 h-8 rounded-full mr-2"
        />
        <div className="font-semibold">{comment.username}</div>
      </div>
      <div className="text-sm mb-2">{comment.comment}</div>
      <div className="text-xs text-gray-500">
        {comment.date} • {comment.likes} likes
      </div>
    </div>
  );
};

export default CommentCard;
