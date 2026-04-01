import { useState, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { ConversationFilter } from '../ConversationFilter/ConversationFilter';
import { FiSearch } from 'react-icons/fi';
import './ConversationList.css';

// Fake Data Generator for Virtualized List Display
const generateConversations = (num) => {
  return Array.from({ length: num }).map((_, i) => ({
    id: i,
    name: `Khách hàng ${i + 1}`,
    lastMessage: `Xin chào, tôi cần tư vấn về nước hoa ${i % 2 === 0 ? 'nam' : 'nữ'} tông gỗ...`,
    time: '10:45 AM',
    channel: i % 3 === 0 ? 'Facebook' : i % 3 === 1 ? 'Zalo' : 'Web',
    unread: i % 5 === 0,
    slaMissed: i % 10 === 0
  }));
};

export const ConversationList = ({ activeId, onSelect }) => {
  const containerRef = useRef(null);
  const [search, setSearch] = useState('');
  const [conversations] = useState(() => generateConversations(1000)); // 1000 items to demo virtualization

  // Simplistic filter for demo purposes
  const filteredData = useMemo(() => {
    return conversations.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [conversations, search]);

  const rowVirtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 85, // Height of each row in px
    overscan: 10
  });

  return (
    <div className="omni-conv-list-container">
      <div className="omni-conv-list-header">
        <div className="omni-conv-list-header__top">
          <h2 className="omni-conv-list-title">Hội thoại ({filteredData.length})</h2>
          <ConversationFilter />
        </div>
        <div className="omni-conv-list-search">
          <Input 
            placeholder="Tìm kiếm khách hàng..." 
            iconLeft={<FiSearch />} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="omni-conv-list-scroll" ref={containerRef}>
        <div 
          className="omni-conv-list-inner" 
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const conv = filteredData[virtualRow.index];
            const isActive = activeId === conv.id;
            
            return (
              <div
                key={virtualRow.index}
                className={`omni-conv-item ${isActive ? 'omni-conv-item--active' : ''}`}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`
                }}
                onClick={() => onSelect(conv)}
              >
                <div className="omni-conv-item__avatar">
                  {conv.name.charAt(0)}
                </div>
                <div className="omni-conv-item__content">
                  <div className="omni-conv-item__top">
                    <span className="omni-conv-item__name" style={{ fontWeight: conv.unread ? 700 : 500 }}>
                      {conv.name}
                    </span>
                    <span className="omni-conv-item__time">{conv.time}</span>
                  </div>
                  <span className="omni-conv-item__message" style={{ color: conv.unread ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {conv.lastMessage}
                  </span>
                  <div className="omni-conv-item__badge">
                    <Badge variant={conv.channel === 'Facebook' ? 'info' : conv.channel === 'Zalo' ? 'success' : 'default'}>
                      {conv.channel}
                    </Badge>
                    {conv.slaMissed && <Badge variant="error">SLA Warning</Badge>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

