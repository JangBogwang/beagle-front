import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import Header from "../components/Header";
import QuestionCard from "../components/QuestionCard";
import styles from './css/TaildocPage.module.css';
import "./css/MainPage.css";

export default function MainPage() {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState(Array(3).fill({ isLoading: true }));
  const [allQuestionsLoaded, setAllQuestionsLoaded] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const { learningLevel, article: articleFromLoading } = location.state || {};

  useEffect(() => {
    document.title = "뉴스 기사 - Beagle Learning";
    if (articleFromLoading) {
      setArticle(articleFromLoading);
      setLoading(false);
      fetchQuestions(articleFromLoading);
    } else {
      setError("기사 데이터를 불러오지 못했습니다.");
      setLoading(false);
    }
  }, [articleFromLoading]);

  useEffect(() => {
    const areAllLoaded = questions.length === 3 && questions.every(q => !q.isLoading);
    if (areAllLoaded) {
      setAllQuestionsLoaded(true);
    }
  }, [questions]);

  const handleViewAnswer = (question) => {
    setSelectedQuestion(question);
    setIsAnswerVisible(false); // 답변 보기 상태 초기화
  };

  const handleBackToMain = () => {
    setSelectedQuestion(null);
  };

  const toggleAnswer = () => {
    setIsAnswerVisible(!isAnswerVisible);
  };

  const updateQuestionState = (index, newState) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      newQuestions[index] = { ...newQuestions[index], ...newState };
      return newQuestions;
    });
  };

  const fetchQuestions = async (articleData) => {
    const query = new URLSearchParams({
      doc_title: articleData.title,
      doc_content: articleData.content,
      doc_url: articleData.url || ""
    }).toString();

    const questionPromises = Array(3).fill(null).map(() => {
      return fetch(`${baseUrl}/gen_question?${query}`, { method: "POST" });
    });

    const questionResults = await Promise.allSettled(questionPromises);

    questionResults.forEach(async (result, index) => {
      if (result.status === "fulfilled") {
        try {
          const questionData = await result.value.json();
          // 질문 난이도 조정 (생략 가능)
          updateQuestionState(index, { ...questionData, isLoading: false, error: null });
          fetchTaildocAndAnswer(questionData, index, articleData);
        } catch (e) {
          updateQuestionState(index, { isLoading: false, error: "질문 파싱 실패" });
        }
      } else {
        updateQuestionState(index, { isLoading: false, error: "질문 생성 실패" });
      }
    });
  };

  const fetchTaildocAndAnswer = async (question, index, mainArticle) => {
    try {
      const taildocRes = await fetch(`${baseUrl}/get_tail_doc?query=${question.question}`, { method: "POST" });
      if (!taildocRes.ok) throw new Error("Failed to fetch taildoc");
      const taildocData = await taildocRes.json();

      const answerRes = await fetch(`${baseUrl}/get_answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.question,
          tail_doc_title: taildocData.title,
          tail_doc_content: taildocData.content,
          tail_doc_url: taildocData.url,
          original_doc_title: mainArticle.title,
          original_doc_content: mainArticle.content,
          original_doc_url: mainArticle.url,
        }),
      });
      if (!answerRes.ok) throw new Error("Failed to fetch answer");
      const answerData = await answerRes.json();
      
      // 꼬리문서 및 답변 난이도 조정 (생략 가능)
      
      updateQuestionState(index, { 
        taildoc: { ...taildocData, answer: answerData.answer }, 
        isLoading: false, 
        error: null, 
        isTaildocRendered: true, 
        isAnswerRendered: true 
      });
    } catch (err) {
      updateQuestionState(index, { isLoading: false, taildoc: null });
    }
  };

  if (loading) {
    return <div className="main-container"><div className="main-content"><h1 className="main-title">기사 로딩 중...</h1></div></div>;
  }

  if (error) {
    return <div className="main-container"><div className="main-content"><h1 className="main-title">에러가 발생했습니다</h1><p className="main-subtitle">{error}</p></div></div>;
  }

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="main-content">
          {selectedQuestion ? (
            // 꼬리 문서 뷰
            <div>
              <button onClick={handleBackToMain} className={styles['back-button']}>← 기사로 돌아가기</button>
              <div className={styles['qa-container']}>
                <div className={styles['qa-card']}>
                    <div className={styles['question-section']}>
                        <div className={styles['question-header']}>
                            <div className={styles['question-icon']}><svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div>
                            <div className={styles['question-label']}>Question</div>
                        </div>
                        <h2 className={styles['question-text']}>{selectedQuestion.question}</h2>
                        <button className={`${styles['toggle-button']} ${isAnswerVisible ? styles.active : ''}`} onClick={toggleAnswer}>
                            <span>{isAnswerVisible ? '답변 숨기기' : '답변 보기'}</span>
                            <span className={styles['toggle-icon']}>▼</span>
                        </button>
                    </div>
                    
                    <div className={`${styles['answer-section']} ${isAnswerVisible ? styles.active : ''}`}>
                        <div className={styles['answer-content']}>
                            <div className={styles['answer-header']}>
                                <div className={styles['answer-icon']}><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
                                <div className={styles['answer-label']}>정답</div>
                            </div>
                            <p className={styles['answer-text']}>{selectedQuestion.taildoc.answer}</p>
                        </div>
                    </div>
                </div>
              </div>

              <div className="main-header" style={{marginTop: '40px'}}>
                <h1 className="main-title">관련 학습 자료</h1>
              </div>
              <div className="main-card">
                <div className="article-header">
                  <h2 className="article-title">{selectedQuestion.taildoc.title}</h2>
                </div>
                <div className="article-content">
                  <ReactMarkdown>{selectedQuestion.taildoc.content}</ReactMarkdown>
                </div>
                <div className="article-meta-bottom">
                  <p><strong>URL:</strong> <a href={selectedQuestion.taildoc.url} target="_blank" rel="noopener noreferrer">{selectedQuestion.taildoc.url}</a></p>
                </div>
              </div>
            </div>
          ) : (
            // 메인 기사 및 질문 목록 뷰
            <>
              <div className="main-header">
                <h1 className="main-title">오늘의 추천 뉴스</h1>
              </div>
              {article && (
                <div className="main-card">
                  <div className="article-header">
                    <h2 className="article-title">{article.title}</h2>
                  </div>
                  <p className="article-content">{article.content}</p>
                  <div className="article-meta-bottom">
                    <div className="article-meta-top">
                      <span><strong>날짜:</strong> {article.date}</span>
                      <span><strong>카테고리:</strong> {Array.isArray(article.category) ? article.category.join(', ') : article.category}</span>
                    </div>
                    <p><strong>원본 링크:</strong> <a href={article.url} target="_blank" rel="noopener noreferrer">{article.url}</a></p>
                  </div>
                </div>
              )}
              {allQuestionsLoaded ? (
                <>
                  <h2 className="questions-section-title">추천 질문</h2>
                  <div className="questions-grid">
                    {questions.map((q, index) => (
                      <QuestionCard key={index} question={q} index={index} onViewAnswer={handleViewAnswer} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="loading-questions">
                  <h2 className="questions-section-title">추천 질문 생성 중...</h2>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
