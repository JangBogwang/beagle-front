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
  const [allQuestionsLoaded, setAllQuestionsLoaded] = useState(false);
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

  useEffect(() => {
    // Check if all 3 questions are loaded (no longer in loading state)
    const areAllLoaded = questions.length === 3 && questions.every(q => !q.isLoading);
    if (areAllLoaded) {
      setAllQuestionsLoaded(true);
    }
  }, [questions]);

 const fetchQuestions = async (articleData) => {
  const query = new URLSearchParams({
    doc_title: articleData.title,
    doc_content: articleData.content,
    doc_url: articleData.url || ""
  }).toString();

  const questionPromises = Array(3).fill(null).map(() => {
    console.log("Requesting new question with article:", { title: articleData.title });
    return fetch(`${baseUrl}/gen_question?${query}`, {
      method: "POST",
    });
  });

  const questionResults = await Promise.allSettled(questionPromises);

  questionResults.forEach(async (result, index) => {
    if (result.status === "fulfilled") {
      try {
        const questionData = await result.value.json();
        console.log(`Received question ${index + 1} data:`, questionData);

        // Render question content based on learning level
        if (learningLevel && questionData.question) {
          try {
            console.log(`Requesting render_level for question ${index + 1}`);
            const renderLevelRes = await fetch(
              `${baseUrl}/render_level`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                input_level: learningLevel,
                input_question: questionData.question,
              }),
            });

            if (renderLevelRes.ok) {
              const renderLevelData = await renderLevelRes.json();
              console.log(`Received render_level for question ${index + 1} data:`, renderLevelData);
              if (renderLevelData.rendered_question) {
                questionData.question = renderLevelData.rendered_question;
              }
            } else {
              console.error(
                `질문 ${index + 1} 난이도 렌더링 실패:`,
                await renderLevelRes.text()
              );
            }
          } catch (renderError) {
            console.error(`질문 ${index + 1} 난이도 렌더링 중 예외 발생:`, renderError);
          }
        }

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
    console.log(`[fetchTaildocAndAnswer] Processing question ${index + 1}:`, question.question);
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
      console.log(`[fetchTaildocAndAnswer] Fetched taildoc for question ${index + 1}:`, taildocData.title, taildocData.content);

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
      console.log(`[fetchTaildocAndAnswer] Fetched answer for question ${index + 1}:`, answerData.answer);

      // Render taildoc content based on learning level
      if (learningLevel && taildocData.title && taildocData.content) {
        try {
          console.log(`Requesting render_level for taildoc ${index + 1}`);
          const renderLevelRes = await fetch(
            `${baseUrl}/render_level`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                input_level: learningLevel,
                input_title: taildocData.title,
                input_content: taildocData.content,
              }),
            });

          if (renderLevelRes.ok) {
            const renderLevelData = await renderLevelRes.json();
            console.log(`Received render_level for taildoc ${index + 1} data:`, renderLevelData);
            taildocData.title =
              renderLevelData.rendered_title || taildocData.title;
            taildocData.content =
              renderLevelData.rendered_content || taildocData.content;
          } else {
            console.error(
              "꼬리문서 난이도 렌더링 실패:",
              await renderLevelRes.text()
            );
          }
        } catch (renderError) {
          console.error("꼬리문서 난이도 렌더링 중 예외 발생:", renderError);
        }
      }

      // Render answer content based on learning level
      if (learningLevel && answerData.answer) {
        try {
          console.log(`Requesting render_level for answer ${index + 1}`);
          const renderAnswerRes = await fetch(
            `${baseUrl}/render_level`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                input_level: learningLevel,
                input_answer: answerData.answer,
              }),
            });

          if (renderAnswerRes.ok) {
            const renderAnswerData = await renderAnswerRes.json();
            console.log(`Received render_level for answer ${index + 1} data:`, renderAnswerData);
            if (renderAnswerData.rendered_answer) {
              answerData.answer = renderAnswerData.rendered_answer;
            }
          } else {
            console.error(
              "답변 난이도 렌더링 실패:",
              await renderAnswerRes.text()
            );
          }
        } catch (renderError) {
          console.error("답변 난이도 렌더링 중 예외 발생:", renderError);
        }
      }
      console.log(`Answer data before updateQuestionState for question ${index + 1}:`, answerData.answer);
      updateQuestionState(index, { taildoc: { ...taildocData, answer: answerData.answer, rendered_question_from_answer: answerData.question }, isLoading: false, error: null, isTaildocRendered: true, isAnswerRendered: true });
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
              </div>
              <p className="article-content">{article.content}</p>
              <div className="article-meta-bottom">
                <div className="article-meta-top">
                  <span><strong>날짜:</strong> {article.date}</span>
                  <span><strong>카테고리:</strong> {Array.isArray(article.category) ? article.category.join(', ') : article.category}</span>
                </div>
                <p>
                  <strong>원본 링크:</strong>{' '}
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    {article.url}
                  </a>
                </p>
              </div>
            </div>
          )}
          {allQuestionsLoaded ? (
            <>
              <h2 className="questions-section-title">추천 질문</h2>
              <div className="questions-grid">
                {questions.map((q, index) => (
                  <QuestionCard key={index} question={q} index={index} />
                ))}
              </div>
            </>
          ):(
            <div className="loading-questions">
               <h2 className="questions-section-title">추천 질문 생성 중...</h2> 
            </div>
          )}
        </div>
      </div>
    </>
  );
}

