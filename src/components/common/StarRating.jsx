import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, reviews, size = 14, showCount = true }) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={star <= Math.round(rating) ? '#F59E0B' : 'none'}
            color={star <= Math.round(rating) ? '#F59E0B' : '#D1D5DB'}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-amber-600">{rating.toFixed(1)}</span>
      {showCount && reviews != null && (
        <span className="text-xs text-gray-400">({reviews.toLocaleString()})</span>
      )}
    </div>
  );
};

export default StarRating;
