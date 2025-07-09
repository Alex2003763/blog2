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
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      
      items.push({
        id,
        text,
        level
      });
    }

    setTocItems(items);
  }, [content]);

  useEffect(() => {
    // Create intersection observer for active section tracking
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
        threshold: 0
      }
    );

    // Observe all headings
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

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
    <div className="table-of-contents">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <LinkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Catalog
          </h3>
        </div>
        
        <nav>
          <ul className="space-y-1">
            {tocItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToHeading(item.id)}
                  className={`
                    w-full text-left text-sm transition-colors hover:text-blue-600 dark:hover:text-blue-400
                    ${activeId === item.id
                      ? 'text-blue-600 dark:text-blue-400 font-medium border-l-2 border-blue-600 dark:border-blue-400 pl-3'
                      : 'text-gray-600 dark:text-gray-400 border-l-2 border-transparent pl-3'
                    }
                    ${item.level === 2 ? 'ml-0' : ''}
                    ${item.level === 3 ? 'ml-4' : ''}
                    ${item.level === 4 ? 'ml-8' : ''}
                    ${item.level === 5 ? 'ml-12' : ''}
                    ${item.level === 6 ? 'ml-16' : ''}
                  `}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}