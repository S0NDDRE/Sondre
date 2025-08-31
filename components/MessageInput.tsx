
import React, { useState } from 'react';
import { SendIcon, SparklesIcon } from './Icons';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  smartReplies: string[];
  isGeneratingReplies: boolean;
}

const SmartReplyPill: React.FC<{ text: string; onClick: () => void }> = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 text-sm font-medium text-sky-300 bg-sky-500/10 rounded-full hover:bg-sky-500/20 transition-colors duration-200"
  >
    {text}
  </button>
);


const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, smartReplies, isGeneratingReplies }) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleSmartReplyClick = (reply: string) => {
    onSendMessage(reply);
  };

  return (
    <div className="p-4 bg-slate-800 border-t border-slate-700">
       {(isGeneratingReplies || smartReplies.length > 0) && (
         <div className="flex items-center gap-2 mb-3 px-2">
            {isGeneratingReplies ? (
              <>
                <SparklesIcon className="w-5 h-5 text-sky-400 animate-pulse" />
                <span className="text-sm text-slate-400">Generating replies...</span>
              </>
            ) : (
                <>
                  <SparklesIcon className="w-5 h-5 text-sky-400" />
                  {smartReplies.map((reply, index) => (
                    <SmartReplyPill key={index} text={reply} onClick={() => handleSmartReplyClick(reply)} />
                  ))}
                </>
            )}
        </div>
       )}

      <form onSubmit={handleSubmit} className="flex items-center gap-4">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 w-full px-4 py-3 bg-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-3 bg-sky-500 rounded-full text-white hover:bg-sky-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
   