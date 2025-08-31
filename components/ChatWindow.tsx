
import React, { useEffect, useRef } from 'react';
import type { Conversation, Message as MessageType, User } from '../types';
import { MOCK_USERS } from '../constants';
import SmartReplyButton from './SmartReplyButton';

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string;
  onGenerateSmartReplies: () => void;
  isGeneratingReplies: boolean;
}

const getParticipantById = (id: string): User | undefined => {
    return MOCK_USERS.find(u => u.id === id);
}

const Message: React.FC<{ message: MessageType; isCurrentUser: boolean }> = ({ message, isCurrentUser }) => {
  const sender = getParticipantById(message.senderId);

  const bubbleClasses = isCurrentUser
    ? 'bg-sky-500 rounded-br-none'
    : 'bg-slate-600 rounded-bl-none';
  const containerClasses = isCurrentUser ? 'justify-end' : 'justify-start';

  return (
    <div className={`flex items-end gap-2 ${containerClasses} max-w-lg ${isCurrentUser ? 'self-end' : 'self-start'}`}>
      {!isCurrentUser && <img src={sender?.avatar} alt={sender?.name} className="w-8 h-8 rounded-full mb-1" />}
      <div className={`p-3 rounded-lg ${bubbleClasses}`}>
        <p className="text-white">{message.text}</p>
        <p className="text-xs text-slate-300 mt-1 text-right">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isCurrentUser && <img src={sender?.avatar} alt={sender?.name} className="w-8 h-8 rounded-full mb-1" />}
    </div>
  );
};


const ChatHeader: React.FC<{ conversation: Conversation; currentUserId: string }> = ({ conversation, currentUserId }) => {
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
    const displayName = otherParticipant ? otherParticipant.name : "Group";
    
    return (
        <header className="flex items-center p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm z-10">
            <h2 className="text-xl font-bold text-white">{displayName}</h2>
        </header>
    );
};

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, currentUserId, onGenerateSmartReplies, isGeneratingReplies }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const showSmartReplyButton = lastMessage && lastMessage.senderId !== currentUserId;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader conversation={conversation} currentUserId={currentUserId} />
        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-900">
            {conversation.messages.map((msg) => (
                <Message key={msg.id} message={msg} isCurrentUser={msg.senderId === currentUserId} />
            ))}
            <div ref={endOfMessagesRef} />
             {showSmartReplyButton && (
                <div className="flex justify-start">
                    <SmartReplyButton onClick={onGenerateSmartReplies} isLoading={isGeneratingReplies} />
                </div>
            )}
        </div>
    </div>
  );
};

export default ChatWindow;
   