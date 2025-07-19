import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import QuestionCard from "../components/QuestionCard"; // Import the new component
import "./css/MainPage.css";

export default function MainPage() {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState(Array(3).fill({ isLoading: true }));
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const location = useLocation();
  const { learningLevel } = location.state || {};
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "뉴스 기사 - Beagle Learning";

    const { articleData } = location.state || {};

    if (!articleData) {
      setError("기사 데이터를 불러오지 못했습니다.");
      setLoading(false);
      return;
    }

    setArticle(articleData);
    setLoading(false);

    // ✅ articleData 세팅 이후 실행되도록 수정
    fetchQuestions(articleData);

  }, [location.state]);

 const fetchQuestions = async (articleData) => {
  const query = new URLSearchParams({
    doc_title: articleData.title,
    doc_content: articleData.content,
    doc_url: articleData.url || ""
  }).toString();

  const questionPromises = Array(3).fill(null).map(() =>
    fetch(`${baseUrl}/gen_question?${query}`, {
      method: "POST", // ✅ 공백 제거
    })
  );

  const questionResults = await Promise.allSettled(questionPromises);

  questionResults.forEach(async (result, index) => {
    if (result.status === "fulfilled") {
      try {
        const questionData = await result.value.json();
        updateQuestionState(index, { ...questionData, isLoading: false, error: null });
        fetchTaildocAndAnswer(questionData, index, articleData);
      } catch (e) {
        updateQuestionState(index, {
          isLoading: false,
          error: "질문 파싱 실패",
        });
      }
    } else {
      console.error("질문 생성 실패:", result.reason);
      updateQuestionState(index, {
        isLoading: false,
        error: "질문 생성 실패",
      });
    }
  });
};

  const fetchTaildocAndAnswer = async (question, index, mainArticle) => {
    try {
      // Fetch taildoc
      const taildocRes = await fetch(
        `${baseUrl}/get_tail_doc?query=${question.question}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        }
      );
      if (!taildocRes.ok) throw new Error("Failed to fetch taildoc");
      const taildocData = await taildocRes.json();

      // Fetch answer
      const answerRes = await fetch(
        `${baseUrl}/get_answer`,
        {
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
        }
      );
      if (!answerRes.ok) throw new Error("Failed to fetch answer");
      const answerData = await answerRes.json();

      updateQuestionState(index, { taildoc: { ...taildocData, ...answerData }, isLoading: false, error: null });
    } catch (err) {
      updateQuestionState(index, { isLoading: false, taildoc: null });
    }
  };

  const updateQuestionState = (index, newState) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      newQuestions[index] = { ...newQuestions[index], ...newState };
      return newQuestions;
    });
  };

  if (loading) {
    return (
      <div className="main-container">
        <div className="main-content">
          <h1 className="main-title">기사 로딩 중...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container">
        <div className="main-content">
          <h1 className="main-title">에러가 발생했습니다</h1>
          <p className="main-subtitle">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="main-content">
          <div className="main-header">
            <h1 className="main-title">오늘의 추천 뉴스</h1>
          </div>
          {article && (
            <div className="main-card">
              <div className="article-header">
                <h2 className="article-title">{article.title}</h2>
                <div className="article-meta-top">
                  <span><strong>날짜:</strong> {article.date}</span>
                  <span><strong>카테고리:</strong> {Array.isArray(article.category) ? article.category.join(', ') : article.category}</span>
                </div>
              </div>
              <p className="article-content">{article.content}</p>
              <div className="article-meta-bottom">
                <p><strong>관련 질문:</strong> {article.query}</p>
                <p>
                  <strong>원본 링크:</strong>{' '}
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    {article.url}
                  </a>
                </p>
              </div>
            </div>
          )}
          <h2 className="questions-section-title">추천 질문</h2>
          <div className="questions-grid">
            {questions.map((q, index) => (
              <QuestionCard key={index} question={q} index={index} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

