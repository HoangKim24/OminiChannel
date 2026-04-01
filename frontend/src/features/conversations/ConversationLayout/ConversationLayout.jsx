import { useState, cloneElement } from 'react';
import './ConversationLayout.css';

export const ConversationLayout = ({ listPane, chatPane, profilePane }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(true);

  return (
    <div className="omni-conv-layout" data-testid="conversation-layout">
      {/* Left Pane: Conversation List */}
      <aside className="omni-conv-layout__pane omni-conv-layout__pane--left">
        {listPane}
      </aside>

      {/* Center Pane: Active Chat */}
      <main className="omni-conv-layout__pane omni-conv-layout__pane--center">
        {/* Pass down the toggle handler so the Chat Pane header can trigger the right sidebar */}
        {cloneElement(chatPane, {
          onToggleProfile: () => setIsProfileOpen(!isProfileOpen),
          isProfileOpen
        })}
      </main>

      {/* Right Pane: Customer Profile */}
      <aside 
        className={`omni-conv-layout__pane omni-conv-layout__pane--right ${!isProfileOpen ? 'omni-conv-layout__pane--right-hidden' : ''}`}
      >
        {profilePane}
      </aside>
    </div>
  );
};

