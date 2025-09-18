import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Suppress ResizeObserver errors due to browser ResizeObserver loop warnings
const resizeObserverLoopErr = /ResizeObserver loop completed with undelivered notifications/;

const originalError = console.error;
console.error = (...args) => {
  if (args.length > 0 && typeof args[0] === 'string' && resizeObserverLoopErr.test(args[0])) {
    return; // Ignore this specific error message
  }
  originalError(...args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
