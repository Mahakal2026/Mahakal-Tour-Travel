import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  className = "",
}) => {
  const roundedRating = Math.round(rating);

  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={`Rating: ${rating} out of ${maxStars}`}>
      {[...Array(maxStars)].map((_, index) => {
        const starNumber = index + 1;
        if (starNumber <= roundedRating) {
          return <FaStar key={index} className="w-4 h-4 text-amber-500 fill-amber-500" />;
        } else {
          return <FaRegStar key={index} className="w-4 h-4 text-slate-300" />;
        }
      })}
    </div>
  );
};

export default StarRating;
