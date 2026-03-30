import React, { useState } from 'react';
import { FiMoreVertical, FiSend, FiSidebar } from 'react-icons/fi';
import { Button } from '../../../components/ui/Button';
import './ConversationDetail.css';

export const ConversationDetail = ({ activeConversation, onToggleProfile, isProfileOpen }) => {
  const [msgInput, setMsgInput] = useState('');

  if (!activeConversation) {
    return (
      <div className="omni-conv-detail__empty">
        <p>Chọn một cuộc hội thoại để bắt đầu</p>
      </div>
    );
  }

  const handleSend = () => {
    if (!msgInput.trim()) return;
    // Todo: dispatch to store/API
    setMsgInput('');
  };

  return (
    <div className="omni-conv-detail">
      <div className="omni-conv-detail__header">
        <div className="omni-conv-detail__info">
          <div className="omni-conv-detail__avatar">{activeConversation.name.charAt(0)}</div>
          <div>
            <span className="omni-conv-detail__name">{activeConversation.name}</span>
            <span className="omni-conv-detail__status">Đang hoạt động trên {activeConversation.channel}</span>
          </div>
        </div>
        <div className="omni-conv-detail__actions">
          <Button variant="ghost" title="Tùy chọn">
            <FiMoreVertical />
          </Button>
          <Button 
            variant={isProfileOpen ? 'secondary' : 'ghost'} 
            onClick={onToggleProfile} 
            title="Đóng/Mở thông tin khách hàng"
          >
            <FiSidebar />
          </Button>
        </div>
      </div>

      <div className="omni-conv-detail__messages">
        {/* Fake messages for layout scaling test */}
        <div className="omni-msg omni-msg--customer">
          {activeConversation.lastMessage}
          <span className="omni-msg__time">10:45 AM</span>
        </div>
        <div className="omni-msg omni-msg--agent">
          Dạ, cửa hàng hiện đang có sẵn một số dòng tông gỗ như trầm hương ạ.
          <span className="omni-msg__time">10:47 AM</span>
        </div>
      </div>

      <div className="omni-conv-detail__input-area">
        <input 
          type="text" 
          className="omni-conv-detail__input" 
          placeholder="Nhập tin nhắn (Enter để gửi)..."
          value={msgInput}
          onChange={e => setMsgInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <Button variant="primary" onClick={handleSend}>
          <FiSend />
        </Button>
      </div>
    </div>
  );
};
