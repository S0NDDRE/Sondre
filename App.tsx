
import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import Welcome from './components/Welcome';
import { MOCK_CONVERSATIONS, CURRENT_USER_ID } from './constants';
import type { Conversation, Message } from './types';
import { generateSmartReplies } from './services/geminiService';

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleSendMessage = (text: string) => {
    if (!selectedConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: CURRENT_USER_ID,
      text,
      timestamp: new Date(),
    };

    const updatedConversations = conversations.map(convo =>
      convo.id === selectedConversationId
        ? { ...convo, messages: [...convo.messages, newMessage] }
        : convo
    );
    setConversations(updatedConversations);
    setSmartReplies([]); // Clear smart replies after sending a message
  };
  
  const handleGenerateSmartReplies = useCallback(async () => {
    if (!selectedConversation || selectedConversation.messages.length === 0) return;

    // Prevent generation if the last message is from the current user
    const lastMessage = selectedConversation.messages[selectedConversation.messages.length - 1];
    if (lastMessage.senderId === CURRENT_USER_ID) return;

    setIsGeneratingReplies(true);
    setSmartReplies([]);
    try {
      const replies = await generateSmartReplies(selectedConversation, CURRENT_USER_ID);
      setSmartReplies(replies);
    } catch (error) {
      console.error("Failed to generate smart replies:", error);
      // Optionally set an error state to show in the UI
    } finally {
      setIsGeneratingReplies(false);
    }
  }, [selectedConversation]);

  return (
    <div className="flex h-screen font-sans text-white bg-slate-900 overflow-hidden">
      <Sidebar
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
      />
      <main className="flex flex-col flex-1">
        {selectedConversation ? (
          <>
            <ChatWindow
              conversation={selectedConversation}
              currentUserId={CURRENT_USER_ID}
              onGenerateSmartReplies={handleGenerateSmartReplies}
              isGeneratingReplies={isGeneratingReplies}
            />
            <MessageInput
              onSendMessage={handleSendMessage}
              smartReplies={smartReplies}
              isGeneratingReplies={isGeneratingReplies}
            />
          </>
        ) : (
          <Welcome />
        )}
      </main>
    </div>
  );
};

export default App;
   