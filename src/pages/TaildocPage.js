import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Header from '../components/Header';
import './css/MainPage.css'; // Reuse main styles
import styles from './css/TaildocPage.module.css'; // Import CSS module

export default function TaildocPage({ taildoc, question }) {
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  if (!taildoc) {
    return (
      <div className="main-container">
        <div className="main-content">
          <h1 className="main-title">Taildoc not found</h1>
          <p className="main-subtitle">No taildoc data was provided.</p>
        </div>
      </div>
    );
  }

  const toggleAnswer = () => {
    setIsAnswerVisible(!isAnswerVisible);
  };

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="main-content">
          <div className={styles['qa-container']}>
            <div className={styles['qa-card']}>
                <div className={styles['question-section']}>
                    <div className={styles['question-header']}>
                        <div className={styles['question-icon']}>
                            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                        </div>
                        <div className={styles['question-label']}>Question</div>
                    </div>
                    <h2 className={styles['question-text']}>{question}</h2>
                    <button className={`${styles['toggle-button']} ${isAnswerVisible ? styles.active : ''}`} onClick={toggleAnswer}>
                        <span>{isAnswerVisible ? '답변 숨기기' : '답변 보기'}</span>
                        <span className={styles['toggle-icon']}>▼</span>
                    </button>
                </div>
                
                <div className={`${styles['answer-section']} ${isAnswerVisible ? styles.active : ''}`}>
                    <div className={styles['answer-content']}>
                        <div className={styles['answer-header']}>
                            <div className={styles['answer-icon']}>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            </div>
                            <div className={styles['answer-label']}>정답</div>
                        </div>
                        <p className={styles['answer-text']}>{taildoc.answer}</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="main-header">
            <h1 className="main-title">관련 학습 자료</h1>
          </div>
          <div className="main-card">
            <div className="article-header">
              <h2 className="article-title">{taildoc.title}</h2>
              <div className="article-meta-top">
              </div>
            </div>
            <div className="article-content">
              <ReactMarkdown>{taildoc.content}</ReactMarkdown>
            </div>
            <div className="article-meta-bottom">
              <span><strong>Date:</strong> {taildoc.date}{'  '}</span>
              <span>
                <strong>Category:</strong>{' '}
                {Array.isArray(taildoc.category)
                  ? taildoc.category
                      .map((c) => c.replace('#@VK#S1#', ''))
                      .join(', ')
                  : taildoc.category}
              </span>
              <p>
                <strong>URL:</strong>{' '}
                <a href={taildoc.url} target="_blank" rel="noopener noreferrer">
                  {taildoc.url}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
