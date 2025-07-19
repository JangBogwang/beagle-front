import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuestionCard({ question, index }) {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleViewAnswerClick = (e) => {
    e.stopPropagation(); // Prevent card from flipping when button is clicked
    if (question.taildoc) {
      navigate('/taildoc', { state: { taildoc: question.taildoc } });
    }
  };

  if (question.isLoading) {
    return (
      <div className="question-card-container">
        <div className="question-card">
          <div className="question-card-front">
            <p>질문 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (question.error) {
    return (
      <div className="question-card-container">
        <div className="question-card">
          <div className="question-card-front">
            <p>에러: {question.error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="question-card-container" onClick={handleCardClick}>
      <div className={`question-card ${isFlipped ? 'flipped' : ''}`}>
        <div className="question-card-back">
          <div className="card-content">
            <div className="scrollable-content">
              {question.question}
            </div>
          </div>
          <button 
            className="view-answer-button" 
            onClick={handleViewAnswerClick} 
            disabled={!question.taildoc}
          >
            {question.taildoc ? '정답 보기' : '답변 준비 중...'}
          </button>
        </div>
        <div className="question-card-front">
          <h3>질문 {index + 1}</h3>
        </div>
      </div>
    </div>
  );
}
