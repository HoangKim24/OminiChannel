import React from 'react';
import { ConversationsPage } from '../../../features/conversations/ConversationsPage';

const CrmTab = () => {
  return (
    <div style={{ height: 'calc(100vh - 120px)' }}> 
      <ConversationsPage />
    </div>
  );
};

export default CrmTab;
