import React, { useState, useEffect } from 'react';
import { LinkIcon } from './icons';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Parse headings from content
    const lines = content.split('\n');
    let inCodeBlock = false;
    const items: TocItem[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 檢測程式碼區塊的開始或結束（圍欄式）
      if (line.startsWith('```') || line.startsWith('~~~')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      // 跳過程式碼區塊內的行
      if (inCodeBlock) {
        continue;
      }

      // 使用正則表達式匹配標題
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') + `-${items.length}`;
        items.push({
          id,
          text,
          level
        });
      }
    }

    setTocItems(items);
  }, [content]);

  useEffect(() => {
    if (tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -35% 0px',
        threshold: 0,
      }
    );

    const articleContent = document.getElementById('article-content');
    if (articleContent) {
      const headingElements = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headingElements.forEach((el) => observer.observe(el));
    }

    return () => {
      observer.disconnect();
    };
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className="sticky p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm top-24 dark:bg-gray-800/50 dark:border-gray-700/50">
      <div className="flex items-center mb-4 space-x-2">
        <LinkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Table of Contents
        </h3>
      </div>
      <nav>
        <ul className="space-y-2">
          {tocItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`
                  w-full text-left text-sm transition-colors
                  ${activeId === item.id
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                  ${item.level === 2 ? 'pl-2' : ''}
                  ${item.level === 3 ? 'pl-6' : ''}
                  ${item.level === 4 ? 'pl-10' : ''}
                  ${item.level === 5 ? 'pl-14' : ''}
                  ${item.level === 6 ? 'pl-18' : ''}
                `}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}