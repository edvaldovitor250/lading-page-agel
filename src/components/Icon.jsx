import React from 'react';

const paths = {
  bolt: <path d="M13 2 4.5 13h6L9.7 22 19.5 10h-6L13 2Z" />,
  leaf: <path d="M20 4.5C12 4.6 6.4 8.4 5 14.5c-.6 2.5.2 4.4 1.3 5.5 1.2-4.4 4.4-7.8 9.6-10.1-4.1 2.9-6.8 6.4-8 10.6 2.1 1.1 5 .7 7.2-1.2C19.1 15.9 20 9.5 20 4.5Z" />,
  shield: <path d="M12 3 4.8 6v5.1c0 4.7 2.9 8.3 7.2 9.9 4.3-1.6 7.2-5.2 7.2-9.9V6L12 3Zm3.5 7.2-4.2 4.4-2.5-2.4 1.2-1.2 1.3 1.3 3-3.2 1.2 1.1Z" />,
  chart: <path d="M4 19V9h3v10H4Zm6 0V4h3v15h-3Zm6 0v-7h3v7h-3Z" />,
  building: <path d="M5 21V4h9v5h5v12H5Zm3-13h3V6H8v2Zm0 4h3v-2H8v2Zm0 4h3v-2H8v2Zm6 1h2v-2h-2v2Zm0-4h2v-2h-2v2Z" />,
  home: <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3V11Z" />,
  document: <path d="M6 2h8l4 4v16H6V2Zm8 1.8V7h3.2L14 3.8ZM9 11h6v2H9v-2Zm0 4h6v2H9v-2Z" />,
  coins: <path d="M8 3c3.3 0 6 1.3 6 3s-2.7 3-6 3-6-1.3-6-3 2.7-3 6-3Zm0 7c2.5 0 4.7-.6 6-1.6V11c0 1.7-2.7 3-6 3s-6-1.3-6-3V8.4C3.3 9.4 5.5 10 8 10Zm8 1c3.3 0 6 1.3 6 3s-2.7 3-6 3c-.5 0-1 0-1.5-.1.3-.6.5-1.2.5-1.9v-3.9c.3 0 .7-.1 1-.1Zm0 7c2.5 0 4.7-.6 6-1.6V19c0 1.7-2.7 3-6 3-2.4 0-4.5-.7-5.4-1.7 1.3-.3 2.5-.9 3.3-1.7.7.2 1.4.4 2.1.4Z" />,
  people: <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21v-2c0-3.3 3.1-6 7-6s7 2.7 7 6v2H2Zm14.5-8c3 0 5.5 2.2 5.5 5v3h-4v-2c0-2.1-.9-4-2.4-5.4.3-.4.6-.6.9-.6Z" />,
  sun: <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5 1 3h-2l1-3Zm0 20-1-3h2l-1 3ZM2 12l3-1v2l-3-1Zm20 0-3 1v-2l3 1ZM4.9 4.9l2.8 1.4-1.4 1.4-1.4-2.8Zm14.2 14.2-2.8-1.4 1.4-1.4 1.4 2.8ZM19.1 4.9l-1.4 2.8-1.4-1.4 2.8-1.4ZM4.9 19.1l1.4-2.8 1.4 1.4-2.8 1.4Z" />,
  arrow: <path d="M5 12h12l-4-4 1.4-1.4L21 13l-6.6 6.4L13 18l4-4H5v-2Z" />,
  check: <path d="m5 12 4 4L19 6l1.5 1.5L9 19 3.5 13.5 5 12Z" />,
  info: <path d="M11 10h2v7h-2v-7Zm0-4h2v2h-2V6Zm1 16a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z" />,
  close: <path d="m6 6 12 12m0-12L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
};

export default function Icon({ name, size = 22, className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" fill="currentColor">
      {paths[name]}
    </svg>
  );
}
