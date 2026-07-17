import React, { createContext, useContext, useState } from "react";

interface ChatContextValue {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  toggleChat: () => void;
}

const ChatContext = createContext<ChatContextValue>({
  chatOpen: false,
  setChatOpen: () => {},
  toggleChat: () => {},
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const toggleChat = () => setChatOpen((o) => !o);

  return (
    <ChatContext.Provider value={{ chatOpen, setChatOpen, toggleChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContext);
}
