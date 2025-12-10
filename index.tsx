import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  // If React fails to mount, show error on screen instead of white screen
  console.error("Failed to mount application:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; color: #ef4444; font-family: sans-serif;">
      <h1>Application Error</h1>
      <p>Failed to load the application.</p>
      <pre style="background: #f1f5f9; padding: 15px; border-radius: 8px; overflow: auto; margin-top: 10px; font-size: 12px;">
        ${error instanceof Error ? error.message : String(error)}
      </pre>
    </div>
  `;
}