// pages/ResultPage.js
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";

export default function ResultPage() {
  // 브라우저 탭 제목 설정
    useEffect(() => {
      document.title = "좋은 질문 생성 - Beagle Demo";
    }, []);

  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate("/");
    return null;
  }

  const MAX_CONTENT_LENGTH = 500;
  const shortenedContent =
    state.news_content.length > MAX_CONTENT_LENGTH
      ? state.news_content.slice(0, MAX_CONTENT_LENGTH) + "..."
      : state.news_content;

  return (
    <div className="container global-background">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <button onClick={() => navigate("/")} style={{ padding: "0.5rem 1rem", backgroundColor: "#0095f6", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold" }}>
          🔄 새 뉴스 분석하기
        </button>
      </div>

      <div className="result-split" style={{ display: "flex", gap: "2rem" }}>
        <div className="result-column" style={{ flex: 1, borderRight: "2px solid #ecf0f1", paddingRight: "1rem" }}>
          <h3 style={{ color: "#262626" }}>📰 원본 뉴스 제목</h3>
          <p>{state.news_title}</p>
          <h3 style={{ color: "#262626" }}>📝 원본 뉴스 내용</h3>
          <p>{shortenedContent}</p>
          {state.original_url && (
            <a href={state.original_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", color: "#2980b9", fontSize: "0.9rem" }}>
              원본 뉴스 전체 보기 ➜
            </a>
          )}
        </div>

                <div className="result-column" style={{ flex: 1, paddingLeft: "1rem" }}>
          <h3 style={{ color: "#8e44ad" }}>🎯 맞춤형 뉴스 제목 ({state.learning_level})</h3>
          <p>{state.customized_news_title}</p>
          <h3 style={{ color: "#8e44ad" }}>📘 맞춤형 뉴스 내용</h3>
          <p>{state.customized_news_content}</p>
          <h3 style={{ color: "#e67e22" }}>❓ 생성된 질문</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {state.questions?.map((q, i) => (
              <li key={i} style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                marginBottom: '1rem'
              }}>
                <strong>Q{i + 1}.</strong> {q}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
               