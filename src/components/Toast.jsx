import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'success', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    // Ensure toast is visible for at least 500ms
    const minDisplayTime = 500;
    const progressStartTime = startTime + minDisplayTime;
    
    const updateProgress = () => {
      const currentTime = Date.now();
      
      if (currentTime < progressStartTime) {
        // Keep progress at 100% for minimum display time
        setProgress(100);
        return;
      }
      
      const remaining = Math.max(0, endTime - currentTime);
      const newProgress = (remaining / (duration - minDisplayTime)) * 100;
      
      if (newProgress <= 0) {
        setIsHiding(true);
        setTimeout(() => {
          setIsVisible(false);
          onClose && onClose();
        }, 300); // Wait for slide out animation
        return;
      }
      
      setProgress(newProgress);
    };

    // Update progress every 50ms for smooth animation
    const intervalId = setInterval(updateProgress, 50);

    return () => {
      clearInterval(intervalId);
    };
  }, [duration, onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHiding(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose && onClose();
      }, 300); // Wait for slide out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`toast toast-${type} ${isHiding ? 'hiding' : ''}`}>
      <div className="toast-content">
        <div className="toast-message">{message}</div>
        <button className="toast-close" onClick={() => {
          setIsHiding(true);
          setTimeout(() => {
            setIsVisible(false);
            onClose && onClose();
          }, 300);
        }}>
          ×
        </button>
      </div>
      <div className="toast-progress">
        <div 
          className="toast-progress-bar" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Toast;
