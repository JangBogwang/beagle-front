// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SurveyPage from "./pages/SurveyPage";
import MainPage from "./pages/MainPage";
import LoadingPage from "./pages/LoadingPage";
import TaildocPage from "./pages/TaildocPage";
import ResultPage from "./pages/ResultPage";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/taildoc" element={<TaildocPage />} />
      </Routes>
    </Router>
  );
}

export default App;