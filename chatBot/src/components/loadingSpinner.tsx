import React from 'react';
import './loadingSpinner.css';

const LoadingSpinner = () => (
  <svg
    className="loading-spinner"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 50 50"
  >
    <circle
      className="spinner-path"
      cx="25"
      cy="25"
      r="20"
      fill="none"
      strokeWidth="5"
    />
  </svg>
);

export default LoadingSpinner;