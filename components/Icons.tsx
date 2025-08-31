
import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const SendIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666zM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"
      clipRule="evenodd"
    />
    <path d="M5.26 17.242a.75.75 0 10-1.06-1.06 7.5 7.5 0 0110.607-10.607.75.75 0 001.06-1.06 9 9 0 00-12.727 12.727z" />
  </svg>
);

export const UserIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

export const GroupIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.57-1.036 1.39-1.953 2.37-2.753m12.413 10.342a9.094 9.094 0 01-3.741.479m-12.413-10.342a9.094 9.094 0 00-3.741-.479m16.154 10.822a9.094 9.094 0 01-3.741.478m-12.413-10.342a9.094 9.094 0 00-3.741-.479M12 21a9.094 9.094 0 007.5-5.221M12 21a9.094 9.094 0 01-7.5-5.221M12 21v-2.135M12 18.865v-1.74M12 17.125v-1.74m0 0A4.5 4.5 0 1012 6.375 4.5 4.5 0 0012 15.385z" />
    </svg>
);

export const MessageIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.53-.405m-3.097-9.406a9.75 9.75 0 015.627-5.437m5.627 5.437a9.75 9.75 0 01-5.627 5.437m0 0a9.757 9.757 0 01-5.627-5.437m5.627 5.437L3 21m18-9v-6.375A2.625 2.625 0 0018.375 3H5.625A2.625 2.625 0 003 5.625v6.375m18 0v6.375a2.625 2.625 0 01-2.625 2.625H5.625a2.625 2.625 0 01-2.625-2.625v-6.375m18 0h-5.625" />
    </svg>
);
   