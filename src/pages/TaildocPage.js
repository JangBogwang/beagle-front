import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import './css/MainPage.css';

export default function TaildocPage() {
  const location = useLocation();
  const { taildoc } = location.state || {};

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

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="main-background-decoration main-decoration-1"></div>
        <div className="main-background-decoration main-decoration-2"></div>
        <div className="main-content">
          <div className="main-header">
            <h1 className="main-title">Tail Document</h1>
          </div>
          <div className="main-card">
            <div className="article-header">
              <h2 className="article-title">{taildoc.title}</h2>
              <div className="article-meta-top">
                <span><strong>Date:</strong> {taildoc.date}</span>
                <span><strong>Category:</strong> {taildoc.category?.join(', ')}</span>
              </div>
            </div>
            <p className="article-content">{taildoc.content}</p>
            <div className="article-meta-bottom">
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
