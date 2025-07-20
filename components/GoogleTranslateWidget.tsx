"use client";
import Script from "next/script";
import Image from "next/image";
import React, { memo } from "react";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const languages = [
  { label: "English", value: "en", src: "https://flagcdn.com/h60/us.png" },
  { label: "繁體中文", value: "zh-TW", src: "https://flagcdn.com/h60/tw.png" },
  { label: "簡體中文", value: "zh-CN", src: "https://flagcdn.com/h60/cn.png" },
  { label: "粵語", value: "yue", src: "https://flagcdn.com/h60/hk.png" },
];

const includedLanguages = languages.map(lang => lang.value).join(",");

export function googleTranslateElementInit() {
  if (window.google && window.google.translate) {
    new window.google.translate.TranslateElement({
      pageLanguage: "zh-TW",
      includedLanguages,
    }, "google_translate_element");
  }
}

const GoogleTranslateContainer = memo(() => {
  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
});
GoogleTranslateContainer.displayName = 'GoogleTranslateContainer';

export function GoogleTranslateWidget() {
  const [isTranslating, setIsTranslating] = React.useState(false);

  const getPrefLangCookie = () => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.startsWith('googtrans=')) {
        return cookie.substring('googtrans='.length, cookie.length);
      }
    }
    return '/zh-TW/en';
  };

  const [langCookie, setLangCookie] = React.useState(decodeURIComponent(getPrefLangCookie()));

  React.useEffect(() => {
    window.googleTranslateElementInit = googleTranslateElementInit;
  }, []);

  const onChange = (value: string) => {
    setIsTranslating(true);
    const lang = "/zh-TW/" + value;
    // Set cookie and reload
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
    document.cookie = `googtrans=${lang}; expires=${date.toUTCString()}; path=/`;
    window.location.reload();
  };

  return (
    <div className="relative">
      {isTranslating && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-8 h-8 border-b-2 rounded-full border-primary animate-spin"></div>
        </div>
      )}
      <GoogleTranslateContainer />
      <LanguageSelector onChange={onChange} value={langCookie} />
    </div>
  );
};

function LanguageSelector({ onChange, value }: { onChange: (value: string) => void, value: string }) {
  const langCookie = value.split("/")[2] || "zh-TW";
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedLanguage = languages.find(lang => lang.value === langCookie);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium transition-colors bg-white border rounded-md shadow-sm text-foreground dark:bg-gray-800 dark:text-white dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedLanguage && (
            <Image
              src={selectedLanguage.src}
              alt={selectedLanguage.label}
              className="w-5 h-5 mr-2"
              width={20}
              height={20}
            />
          )}
          {selectedLanguage?.label}
          <svg
            className="w-5 h-5 ml-2 -mr-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-600">
          <div className="py-1">
            {languages.map((lang) => (
              <a
                key={lang.value}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(lang.value);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <Image
                  src={lang.src}
                  alt={lang.label}
                  className="w-5 h-5 mr-3"
                  width={20}
                  height={20}
                />
                {lang.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}