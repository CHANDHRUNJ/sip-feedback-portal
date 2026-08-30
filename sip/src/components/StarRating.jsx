import React from 'react';

export const StarRating = ({ rating, setRating, disabled = false }) => {
  const stars = [1, 2, 3, 4];
  const ratingText = ["Average", "Good", "Very Good", "Excellent"];

  return (
    <div className="flex items-center">
      {stars.map((star) => (
        <span
          key={star}
          className={`text-2xl ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
          onClick={() => !disabled && setRating(star)}
        >
          &#9733;
        </span>
      ))}
      <span className="ml-3 font-bold text-gray-700">{ratingText[rating - 1] || 'Rate'}</span>
    </div>
  );
};

