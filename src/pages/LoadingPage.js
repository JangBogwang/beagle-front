import React, { useEffect, useState } from "react";
import { DotLoader } from "react-spinners";
import { useLocation, useNavigate } from "react-router-dom";
import "./css/LoadingPage.css"; // Import the new CSS file

export default function LoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { learningLevel, selectedCategory } = location.state || {};
  const [loadingMessage, setLoadingMessage] = useState(
    selectedCategory
      ? `${selectedCategory} 분야의 학습 자료를 준비 중입니다...`
      : `학습 자료를 준비 중입니다...`
  );
  const BaseURL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    document.title = "데이터 로딩 중 - Beagle Learning";
    const fetchArticle = async () => {
      if (!learningLevel || !selectedCategory) {
        setLoadingMessage("필요한 정보가 부족합니다. 설문 페이지로 돌아갑니다.");
        setTimeout(() => navigate("/survey"), 2000);
        return;
      }

      try {
        console.log("Requesting article with category:", selectedCategory);
        const articleRes = await fetch(
          `${BaseURL}/get_first_doc?category=${selectedCategory}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!articleRes.ok) {
          throw new Error(`Failed to fetch article: ${articleRes.statusText}`);
        }

        const articleData = await articleRes.json();
        console.log("Received article data:", articleData);

        // Validate articleData
        if (!articleData || !articleData.title || !articleData.content) {
          throw new Error("Invalid or empty article data received.");
        }

        // Call /render_level API
        console.log("Requesting render_level with:", { learningLevel, title: articleData.title });
        const renderLevelRes = await fetch(
          `${BaseURL}/render_level`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input_level: learningLevel,
              input_title: articleData.title,
              input_content: articleData.content,
            }),
          }
        );

        if (!renderLevelRes.ok) {
          throw new Error(`Failed to render level: ${renderLevelRes.statusText}`);
        }

        const renderedData = await renderLevelRes.json();
        console.log("Received render_level data:", renderedData);

        const finalArticle = {
          ...articleData,
          title: renderedData.rendered_title || articleData.title,
          content: renderedData.rendered_content || articleData.content,
        };

        // Navigate to main with the final, processed article data
        navigate("/main", { state: { article: finalArticle, learningLevel } });
      } catch (error) {
        console.error("Error fetching article:", error);
        setLoadingMessage("학습 자료를 불러오는 데 실패했습니다. 다시 시도해주세요.");
        setTimeout(() => navigate("/survey"), 3000); // Navigate back to survey on error
      }
    };

    fetchArticle();
  }, [navigate, learningLevel, selectedCategory]);

  return (
    <div className="loading-container">
      <div className="loading-background-decoration loading-decoration-1"></div>
      <div className="loading-background-decoration loading-decoration-2"></div>

      <div className="loading-content">
        <h2 className="loading-title">{loadingMessage}</h2>
        <DotLoader color="#0095f6" size={60} />
        <p className="loading-subtitle">잠시만 기다려 주세요</p>
      </div>
    </div>
  );
}