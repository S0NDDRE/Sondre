
import type { User, Conversation } from './types';

export const CURRENT_USER_ID = 'user-1';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'You', avatar: 'https://picsum.photos/seed/you/48/48' },
  { id: 'user-2', name: 'Alex', avatar: 'https://picsum.photos/seed/alex/48/48' },
  { id: 'user-3', name: 'Sam', avatar: 'https://picsum.photos/seed/sam/48/48' },
  { id: 'user-4', name: 'Project Team', avatar: 'https://picsum.photos/seed/team/48/48' },
  { id: 'user-5', name: 'Casey', avatar: 'https://picsum.photos/seed/casey/48/48' },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'convo-1',
    participants: MOCK_USERS.filter(u => ['user-1', 'user-2'].includes(u.id)),
    messages: [
      { id: 'msg-1', senderId: 'user-2', text: 'Hey, did you see the new design mockups?', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
      { id: 'msg-2', senderId: 'user-1', text: 'Not yet, I was just about to check them out. Are they in Figma?', timestamp: new Date(Date.now() - 1000 * 60 * 4) },
      { id: 'msg-3', senderId: 'user-2', text: 'Yep, same link as always. Let me know what you think!', timestamp: new Date(Date.now() - 1000 * 60 * 3) },
    ],
  },
  {
    id: 'convo-2',
    participants: MOCK_USERS.filter(u => ['user-1', 'user-3'].includes(u.id)),
    messages: [
      { id: 'msg-4', senderId: 'user-3', text: 'Lunch today?', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
      { id: 'msg-5', senderId: 'user-1', text: 'Sounds good! What time?', timestamp: new Date(Date.now() - 1000 * 60 * 28) },
      { id: 'msg-6', senderId: 'user-3', text: '12:30pm work for you?', timestamp: new Date(Date.now() - 1000 * 60 * 25) },
    ],
  },
   {
    id: 'convo-3',
    participants: MOCK_USERS.filter(u => ['user-1', 'user-4'].includes(u.id)),
    messages: [
      { id: 'msg-7', senderId: 'user-4', text: 'Quick reminder: Project Alpha sprint planning is tomorrow at 10 AM.', timestamp: new Date(Date.now() - 1000 * 60 * 120) },
    ],
  },
  {
    id: 'convo-4',
    participants: MOCK_USERS.filter(u => ['user-1', 'user-5'].includes(u.id)),
    messages: [
      { id: 'msg-8', senderId: 'user-5', text: 'I\'m working on the Gemini API integration. It\'s pretty amazing!', timestamp: new Date(Date.now() - 1000 * 60 * 10) },
      { id: 'msg-9', senderId: 'user-1', text: 'Awesome! I was just reading the docs. The smart reply feature looks promising.', timestamp: new Date(Date.now() - 1000 * 60 * 9) },
      { id: 'msg-10', senderId: 'user-5', text: 'Definitely. The JSON output mode is a game-changer for structured data.', timestamp: new Date(Date.now() - 1000 * 60 * 8) },
    ],
  }
];
   