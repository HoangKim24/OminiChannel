import { useEffect, useState } from 'react';
import { FiMoreVertical, FiSend, FiSidebar } from 'react-icons/fi';
import { Button } from '../../../components/ui/Button';
import './ConversationDetail.css';

export const ConversationDetail = ({ activeConversation, onToggleProfile, isProfileOpen }) => {
  const [msgInput, setMsgInput] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    const initialMessages = [
      {
        id: `${activeConversation.id}-customer`,
        role: 'customer',
        text: activeConversation.lastMessage,
        time: activeConversation.time || '10:45 AM',
      },
      {
        id: `${activeConversation.id}-agent`,
        role: 'agent',
        text: 'Dạ, cửa hàng hiện đang có sẵn một số dòng tông gỗ như trầm hương ạ.',
        time: '10:47 AM',
      },
    ];

    setMessages(initialMessages);
    setMsgInput('');
  }, [activeConversation]);

  if (!activeConversation) {
    return (
      <div className="omni-conv-detail__empty">
        <p>Chọn một cuộc hội thoại để bắt đầu</p>
      </div>
    );
  }

  const handleSend = () => {
    const trimmed = msgInput.trim();
    if (!trimmed || !activeConversation) return;

    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [
      ...prev,
      {
        id: `${activeConversation.id}-agent-${Date.now()}`,
        role: 'agent',
        text: trimmed,
        time,
      },
    ]);

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
        {messages.map(message => (
          <div
            key={message.id}
            className={`omni-msg ${message.role === 'agent' ? 'omni-msg--agent' : 'omni-msg--customer'}`}
          >
            {message.text}
            <span className="omni-msg__time">{message.time}</span>
          </div>
        ))}
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

