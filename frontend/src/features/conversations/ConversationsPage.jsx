import { useState } from 'react';
import { ConversationLayout } from './ConversationLayout/ConversationLayout';
import { ConversationList } from './ConversationList/ConversationList';
import { ConversationDetail } from './ConversationDetail/ConversationDetail';
import { CustomerProfile } from './CustomerProfile/CustomerProfile';

export const ConversationsPage = () => {
  const [activeConversation, setActiveConversation] = useState(null);

  return (
    <div style={{ padding: '0 20px', height: '100%' }}>
      <h2 className="brand-font" style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Customer Support (Omnichannel)</h2>
      <ConversationLayout
        listPane={
          <ConversationList 
            activeId={activeConversation?.id} 
            onSelect={setActiveConversation} 
          />
        }
        chatPane={
          <ConversationDetail 
            activeConversation={activeConversation} 
          />
        }
        profilePane={
          <CustomerProfile 
            customer={activeConversation} 
          />
        }
      />
    </div>
  );
};

