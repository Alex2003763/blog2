import React, { useState, useEffect } from 'react';

const ProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const articleContent = document.getElementById('article-content');
    
    if (!articleContent) return;
    
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const articleRect = articleContent.getBoundingClientRect();
      const articleTop = articleRect.top + window.scrollY;
      const articleHeight = articleRect.height;
      const windowHeight = window.innerHeight;
      
      // 計算進度百分比 (0-100)
      const scrollPosition = scrollTop - articleTop;
      const maxScroll = articleHeight - windowHeight;
      const percentage = Math.max(0, Math.min(100, (scrollPosition / maxScroll) * 100));
      
      setProgress(percentage);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 z-50 w-full h-1 bg-gray-200">
      <div 
        className="h-full transition-all duration-300 ease-out bg-blue-600"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;