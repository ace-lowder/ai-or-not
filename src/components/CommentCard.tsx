import React, { useState, useEffect } from 'react';
import profileAI from '../assets/profile-ai.png';
import { Events } from '../contexts/Events';
import { validateProfilePicture } from '../services/youtubeService'; // Make sure to import validateProfilePicture

interface Comment {
  profilePicture: string;
  username: string;
  comment: string;
  likes: number;
  date: string;
  isReal: boolean;
  videoName?: string;
  video?: string;
}

interface CommentCardProps {
  comment: Comment;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  const [hidden, setHidden] = useState(true);
  const [validatedProfilePicture, setValidatedProfilePicture] = useState(
    comment.profilePicture,
  );

  useEffect(() => {
    const reveal = () => setHidden(false);

    Events.subscribe('correct', reveal);
    Events.subscribe('incorrect', reveal);

    return () => {
      Events.unsubscribe('correct', reveal);
      Events.unsubscribe('incorrect', reveal);
    };
  }, []);

  useEffect(() => {
    validateProfilePicture(comment.profilePicture, comment.username).then(
      validatedUrl => {
        setValidatedProfilePicture(validatedUrl);
      },
    );
  }, [comment.profilePicture, comment.username]);

  return (
    <div className="max-w-md bg-white rounded shadow-lg p-4 text-gray-900 flex flex-col gap-2">
      <div className="flex items-center">
        <img
          src={!hidden && !comment.isReal ? profileAI : validatedProfilePicture}
          alt="Profile"
          className="w-8 h-8 rounded-full mr-2"
        />
        <div className="font-semibold">
          {!hidden && !comment.isReal ? 'Chat GPT' : comment.username}
        </div>
      </div>
      <div
        className="text-sm"
        dangerouslySetInnerHTML={{ __html: comment.comment || '' }}
      />
      <div className="text-xs text-gray-500">
        {comment.date} • {comment.likes} likes
      </div>

      {!hidden && comment.video && comment.isReal && (
        <div className="flex gap-2 mt-2 items-center">
          <img
            src={comment.video}
            alt="Video"
            className="w-1/2 h-auto rounded-md"
          />
          <div>
            <div className="text-xs">Found on</div>
            <span className="font-bold text-sm line-clamp-2 overflow-hidden">
              {comment.videoName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentCard;
