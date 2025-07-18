import React from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from './icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (currentPage < 5) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage > totalPages - 4) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center px-4 mt-8 space-x-1 sm:space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center px-3 py-2 text-sm font-medium border rounded-md text-foreground bg-card hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed dark:text-white"
        aria-label="Previous Page"
      >
        <ArrowLeftIcon className="w-4 h-4 sm:mr-1" />
        <span className="hidden sm:inline">Previous</span>
      </button>
      
      <div className="flex items-center space-x-2 overflow-x-auto">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-sm font-medium text-foreground dark:text-white">
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`px-3 py-2 text-sm font-medium rounded-md min-w-[40px] border ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'text-foreground bg-card border-border hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center px-3 py-2 text-sm font-medium border rounded-md text-foreground bg-card hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed dark:text-white"
        aria-label="Next Page"
      >
        <span className="hidden sm:inline">Next</span>
        <ArrowRightIcon className="w-4 h-4 sm:ml-1" />
      </button>
    </div>
  );
}