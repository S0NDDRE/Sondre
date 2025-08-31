
import React from 'react';
import { MessageIcon } from './Icons';

const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-slate-900">
      <div className="p-8 bg-slate-800 rounded-2xl shadow-xl">
        <MessageIcon className="w-20 h-20 mx-auto text-sky-400" />
        <h2 className="mt-6 text-3xl font-bold text-white">Welcome to Gemini Chat</h2>
        <p className="mt-2 text-lg text-slate-400">Select a conversation from the sidebar to start chatting.</p>
      </div>
    </div>
  );
};

export default Welcome;
   