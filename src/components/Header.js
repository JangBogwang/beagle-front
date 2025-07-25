import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export default function Header() {
  return (
    <header className="hd">
      <div className="hd__inner">
        <Link to="/survey" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1 className="hd__logo">Beagle Demo</h1>
        </Link>
        <nav className="hd__nav">

        </nav>
      </div>
    </header>
  );
}
