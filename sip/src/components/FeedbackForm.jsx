// src/components/FeedbackForm.jsx
import React, { useState } from 'react';
import { StarRating } from './StarRating';

const FeedbackForm = ({ user }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newFeedback = {
      name: user.name,
      roll: user.roll,
      feedback,
      rating
    };

    const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    feedbacks.push(newFeedback);
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    alert('Feedback submitted!');
    setFeedback('');
    setRating(0);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded space-y-4 max-w-xl mx-auto">
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Write your feedback..."
        className="w-full border p-2 rounded"
        required
      ></textarea>
      <StarRating rating={rating} setRating={setRating} />
      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">Submit</button>
    </form>
  );
};

export default FeedbackForm;
