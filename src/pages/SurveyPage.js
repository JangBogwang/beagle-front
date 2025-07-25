// SurveyPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import { Cpu, Landmark, Users, Palette, FlaskConical, Leaf } from 'lucide-react';
import './css/SurveyPage.css';

function SurveyPage() {
  const [learningLevel, setLearningLevel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  const categories = {
    '기술': { icon: <Cpu size={48} /> },
    '경제': { icon: <Landmark size={48} /> },
    '사회': { icon: <Users size={48} /> },
    '문화': { icon: <Palette size={48} /> },
    '과학': { icon: <FlaskConical size={48} /> },
    '환경': { icon: <Leaf size={48} /> },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!learningLevel || !selectedCategory) {
      alert(!learningLevel ? '학습 수준을 선택해주세요.' : '선호하는 분야를 선택해주세요.');
      return;
    }
    localStorage.setItem('learningLevel', learningLevel);
    localStorage.setItem('preferredCategory', selectedCategory);
    navigate('/loading', { state: { learningLevel, selectedCategory } });
  };

  return (
    <>
        <Header/>
        <div className="survey-container">
            <div className="survey-background-decoration survey-decoration-1"></div>
            <div className="survey-background-decoration survey-decoration-2"></div>
            
            <div className="survey-content">
                <div className="survey-header">
                    <h1 className="survey-title">학습 선호도 조사</h1>
                    <p className="survey-subtitle">학습 수준과 선호 분야를 선택해주세요</p>
                </div>

                <div className="survey-form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="learningLevel" className="input-label">학습 수준 선택</label>
                            <select
                                id="learningLevel"
                                className="select-field"
                                value={learningLevel}
                                onChange={(e) => setLearningLevel(e.target.value)}
                            >
                                <option value="">선택하세요</option>
                                <option value="초등(1~3학년)">초등(1~3학년)</option>
                                <option value="초등(4~6학년)">초등(4~6학년)</option>
                                <option value="중학교">중학교</option>
                                <option value="고등학교">고등학교</option>
                                <option value="성인">성인/대학생</option>
                            </select>
                        </div>

                        <h3 className="input-label" style={{ marginBottom: '15px' }}>선호 분야 선택 (1개)</h3>
                        <div className="category-grid">
                            {Object.entries(categories).map(([category, { icon }]) => (
                                <label
                                    key={category}
                                    className={`category-card ${selectedCategory === category ? 'selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="category"
                                        value={category}
                                        checked={selectedCategory === category}
                                        onChange={() => setSelectedCategory(category)}
                                    />
                                    <div className="category-content">
                                        <div className="category-icon">{icon}</div>
                                        <h4>{category}</h4>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <button type="submit" className="submit-button">
                            제출
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </>
  );
}

export default SurveyPage;