import React, { useState, useRef, useEffect } from 'react';
import { FiFilter } from 'react-icons/fi';
import { Button } from '../../../components/ui/Button';
import './ConversationFilter.css';

export const ConversationFilter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popoverRef]);

  return (
    <div className="omni-conv-filter" ref={popoverRef}>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsOpen(!isOpen)}
        title="Bộ lọc nâng cao"
        aria-label="Toggle Advanced Filters"
      >
        <FiFilter /> BỘ LỌC
      </Button>

      {isOpen && (
        <div className="omni-conv-filter__popover">
          <h4>Bộ lọc nâng cao</h4>
          <div className="omni-conv-filter__group">
            <label>Kênh (Channel)</label>
            <select className="omni-conv-filter__select">
              <option value="all">Tất cả</option>
              <option value="fb">Facebook</option>
              <option value="zalo">Zalo</option>
              <option value="web">Web Chat</option>
            </select>
          </div>
          <div className="omni-conv-filter__group">
            <label>Trạng thái vòng đời SLA</label>
            <select className="omni-conv-filter__select">
              <option value="all">Tất cả</option>
              <option value="ok">Trong hạn</option>
              <option value="violated">Quá hạn</option>
            </select>
          </div>
          <div className="omni-conv-filter__actions">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Hủy</Button>
            <Button variant="primary" size="sm" onClick={() => setIsOpen(false)}>Áp dụng</Button>
          </div>
        </div>
      )}
    </div>
  );
};
