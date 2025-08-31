
import React from 'react';
import type { Conversation, User } from '../types';
import { CURRENT_USER_ID } from '../constants';
import { GroupIcon, UserIcon } from './Icons';

interface SidebarProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

const getOtherParticipant = (participants: User[]): User | undefined => {
  return participants.find(p => p.id !== CURRENT_USER_ID);
}

const SidebarHeader: React.FC = () => (
  <div className="p-4 border-b border-slate-700">
    <h1 className="text-xl font-bold text-white">Gemini Chat</h1>
  </div>
);

const ConversationItem: React.FC<{ conversation: Conversation; isSelected: boolean; onSelect: () => void }> = ({ conversation, isSelected, onSelect }) => {
  const otherParticipant = getOtherParticipant(conversation.participants);
  const displayName = otherParticipant ? otherParticipant.name : "Group";
  const avatar = otherParticipant ? otherParticipant.avatar : '';
  const isGroup = conversation.participants.length > 2 || !otherParticipant;
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  return (
    <li
      onClick={onSelect}
      className={`flex items-center p-3 cursor-pointer transition-colors duration-200 ${
        isSelected ? 'bg-sky-500/20' : 'hover:bg-slate-700/50'
      }`}
    >
      <div className="relative mr-4">
        {isGroup ? (
          <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center">
            <GroupIcon className="w-6 h-6 text-slate-300" />
          </div>
        ) : (
          <img src={avatar} alt={displayName} className="w-12 h-12 rounded-full" />
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <h3 className="font-semibold text-slate-100 truncate">{displayName}</h3>
        <p className="text-sm text-slate-400 truncate">{lastMessage?.text || 'No messages yet'}</p>
      </div>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ conversations, selectedConversationId, onSelectConversation }) => {
  return (
    <aside className="w-80 bg-slate-800 flex flex-col border-r border-slate-700 flex-shrink-0">
      <SidebarHeader />
      <nav className="flex-1 overflow-y-auto">
        <ul>
          {conversations.map(convo => (
            <ConversationItem
              key={convo.id}
              conversation={convo}
              isSelected={convo.id === selectedConversationId}
              onSelect={() => onSelectConversation(convo.id)}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
   