import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';

const Chatbot = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { from: 'bot', text: '👋 Xin chào! Tôi là trợ lý ảo. Bạn cần hỗ trợ gì?', timestamp: new Date() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const setQuizOpen = useAppStore(state => state.setQuizOpen);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  const botReplies = {
    greeting: [
      '👋 Xin chào! Tôi là trợ lý KP Luxury. Hỏi tôi bất cứ điều gì về nước hoa hoặc đơn hàng của bạn nhé!',
      '🌸 Chào bạn! Mình có thể giúp bạn tìm mùi hương hoàn hảo. Bạn quan tâm điều gì?'
    ],
    fragrance: [
      '💎 KP Luxury có nhiều dòng nước hoa sang trọng. Bạn thích hương hoa, hương gỗ hay hương tươi mát?',
      '🌹 Hương hoa rất được yêu thích! Bạn đang tìm nước hoa cho dịp nào?'
    ],
    order: [
      '📦 Bạn cần hỗ trợ về đơn hàng? Vui lòng cung cấp mã đơn hàng của bạn.',
      '✅ Tôi sẵn sàng giúp bạn theo dõi đơn hàng. Hãy cho tôi biết mã đơn hàng!'
    ],
    delivery: [
      '🚀 KP Luxury giao hàng 2H nội thành TP.HCM và Hà Nội!',
      '📍 Bạn cũng có thể nhận hàng tại 15 showroom của chúng tôi trên toàn quốc.'
    ],
    payment: [
      '💳 Chúng tôi hỗ trợ thanh toán bằng thẻ tín dụng, chuyển khoản và VNPay.',
      '🏦 Bạn có thể thanh toán khi nhận hàng hoặc trực tuyến. Chọn cách nào phù hợp!'
    ]
  };

  const quickSuggestions = [
    { label: '🔍 Tìm mùi hương', action: 'quiz' },
    { label: '📦 Theo dõi đơn hàng', action: 'order' },
    { label: '🚚 Giao hàng & Nhận hàng', action: 'delivery' },
    { label: '💰 Hình thức thanh toán', action: 'payment' }
  ];

  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { from: 'user', text: userMessage, timestamp: new Date() }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = '';
      const lowerInput = userMessage.toLowerCase();

      if (lowerInput.includes('quiz') || lowerInput.includes('tư vấn') || lowerInput.includes('tìm')) {
        botResponse = botReplies.fragrance[Math.floor(Math.random() * botReplies.fragrance.length)];
      } else if (lowerInput.includes('đơn hàng') || lowerInput.includes('order')) {
        botResponse = botReplies.order[Math.floor(Math.random() * botReplies.order.length)];
      } else if (lowerInput.includes('giao') || lowerInput.includes('nhận') || lowerInput.includes('delivery')) {
        botResponse = botReplies.delivery[Math.floor(Math.random() * botReplies.delivery.length)];
      } else if (lowerInput.includes('thanh toán') || lowerInput.includes('payment')) {
        botResponse = botReplies.payment[Math.floor(Math.random() * botReplies.payment.length)];
      } else {
        botResponse = botReplies.fragrance[Math.floor(Math.random() * botReplies.fragrance.length)];
      }

      setChatMessages(prev => [...prev, { from: 'bot', text: botResponse, timestamp: new Date() }]);
      setIsTyping(false);
    }, 800);
  };

  const handleQuickSuggestion = (action) => {
    switch (action) {
      case 'quiz':
        setQuizOpen(true);
        setChatOpen(false);
        break;
      case 'order':
        setChatMessages(prev => [...prev, { from: 'user', text: '📦 Theo dõi đơn hàng', timestamp: new Date() }]);
        setTimeout(() => setChatMessages(prev => [...prev, { from: 'bot', text: botReplies.order[0], timestamp: new Date() }]), 600);
        break;
      case 'delivery':
        setChatMessages(prev => [...prev, { from: 'user', text: '🚚 Giao hàng & Nhận hàng', timestamp: new Date() }]);
        setTimeout(() => setChatMessages(prev => [...prev, { from: 'bot', text: botReplies.delivery[0], timestamp: new Date() }]), 600);
        break;
      case 'payment':
        setChatMessages(prev => [...prev, { from: 'user', text: '💰 Hình thức thanh toán', timestamp: new Date() }]);
        setTimeout(() => setChatMessages(prev => [...prev, { from: 'bot', text: botReplies.payment[0], timestamp: new Date() }]), 600);
        break;
      default:
        break;
    }
  };

  const clearChat = () => {
    if (window.confirm('Bạn có chắc muốn xóa lịch sử chat?')) {
      setChatMessages([{ from: 'bot', text: '👋 Chat đã được xóa. Hãy bắt đầu cuộc trò chuyện mới!', timestamp: new Date() }]);
    }
  };

  return (
    <>
      <button className="chatbot-toggle" onClick={() => setChatOpen(!chatOpen)} title="Mở/ Đóng trợ lý ảo">💬</button>

      {chatOpen && (
        <div className="chatbot-widget">
          <div className="chatbot-header">
            <div>
              <span style={{ fontSize: '0.85rem' }}>🤖 Trợ Lý KP Luxury</span>
              <p style={{ fontSize: '0.7rem', opacity: 0.8, margin: '0.2rem 0 0' }}>Sẵn sàng giúp bạn 24/7</p>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>

          <div className="chatbot-messages" style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f5f5f5' }}>
            {chatMessages.length === 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {quickSuggestions.map((suggestion, idx) => (
                  <button key={idx} style={{ padding: '0.5rem 0.8rem', background: '#fff', border: '1px solid #ddd', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', color: '#333' }}
                    onClick={() => handleQuickSuggestion(suggestion.action)}>{suggestion.label}</button>
                ))}
              </div>
            )}

            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', background: msg.from === 'user' ? 'var(--accent-gold)' : '#fff', color: msg.from === 'user' ? '#fff' : '#333', padding: '0.8rem', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <span>{msg.text}</span>
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', background: '#fff', padding: '0.8rem', borderRadius: '12px' }}>
                <span className="typing-indicator"><span>.</span><span>.</span><span>.</span></span>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          <div className="chatbot-input" style={{ display: 'flex', padding: '0.5rem', background: '#fff', borderTop: '1px solid #eee' }}>
            <input type="text" placeholder="Nhập tin nhắn..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
              style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
            <button onClick={handleSendChat} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', marginLeft: '0.5rem' }}>📤</button>
            <button onClick={clearChat} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', marginLeft: '0.5rem' }}>🗑</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;

