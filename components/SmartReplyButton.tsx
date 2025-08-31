
import React from 'react';
import { SparklesIcon } from './Icons';

interface SmartReplyButtonProps {
    onClick: () => void;
    isLoading: boolean;
}

const SmartReplyButton: React.FC<SmartReplyButtonProps> = ({ onClick, isLoading }) => {
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-300 bg-sky-900/50 border border-sky-500/30 rounded-full hover:bg-sky-900/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
        >
            {isLoading ? (
                <>
                    <div className="w-5 h-5 border-2 border-sky-300 border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                </>
            ) : (
                <>
                    <SparklesIcon className="w-5 h-5" />
                    <span>Smart Reply</span>
                </>
            )}
        </button>
    );
};

export default SmartReplyButton;
   