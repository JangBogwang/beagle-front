import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Header from '../components/Header';
import './css/MainPage.css'; // Reuse main styles
import styles from './css/TaildocPage.module.css'; // Import CSS module

export default function TaildocPage() {
  const location = useLocation();
  const { taildoc, question } = location.state || {};
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
          {question && (
            <div className={styles.questionDisplayCard}>
              <h2 className={styles.questionTitle}>질문</h2>
              <p className={styles.questionContent}>{question}</p>
            </div>
          )}

          {taildoc.answer && (
            <div className={styles.answerSection}>
              <button onClick={toggleAnswer} className={styles.answerToggleButton}>
                {isAnswerVisible ? '답변 숨기기' : '답변 보기'}
              </button>
              {isAnswerVisible && (
                <div className={styles.answerContent}>
                  <p>{taildoc.answer}</p>
                </div>
              )}
            </div>
          )}

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
