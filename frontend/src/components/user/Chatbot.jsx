import React, { useEffect, useRef } from 'react';

const Chatbot = ({
  chatOpen,
  setChatOpen,
  chatMessages,
  setChatMessages,
  chatInput,
  setChatInput,
  user,
  openDetail,
  products,
  setPage,
  resetQuiz
}) => {
  const chatEndRef = useRef(null);
  const [isTyping, setIsTyping] = React.useState(false);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

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
    setChatMessages(prev => [...prev, { from: 'user', text: userMessage }]);
    setChatInput('');

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      let botResponse = '';

      // Smart routing based on keywords
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
        resetQuiz();
        setChatOpen(false);
        break;
      case 'order':
        setChatMessages(prev => [...prev, { from: 'user', text: '📦 Theo dõi đơn hàng' }]);
        setTimeout(() => {
          setChatMessages(prev => [...prev, { from: 'bot', text: botReplies.order[0] }]);
        }, 600);
        break;
      case 'delivery':
        setChatMessages(prev => [...prev, { from: 'user', text: '🚚 Giao hàng & Nhận hàng' }]);
        setTimeout(() => {
          setChatMessages(prev => [...prev, { from: 'bot', text: botReplies.delivery[0] }]);
        }, 600);
        break;
      case 'payment':
        setChatMessages(prev => [...prev, { from: 'user', text: '💰 Hình thức thanh toán' }]);
        setTimeout(() => {
          setChatMessages(prev => [...prev, { from: 'bot', text: botReplies.payment[0] }]);
        }, 600);
        break;
      default:
        break;
    }
  };

  const clearChat = () => {
    if (window.confirm('Bạn có chắc muốn xóa lịch sử chat?')) {
      setChatMessages([
        { from: 'bot', text: '👋 Chat đã được xóa. Hãy bắt đầu cuộc trò chuyện mới!' }
      ]);
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        className="chatbot-toggle"
        onClick={() => setChatOpen(!chatOpen)}
        title="Mở/ Đóng trợ lý ảo"
      >
        💬
      </button>

      {/* Chatbot Widget */}
      {chatOpen && (
        <div className="chatbot-widget">
          {/* Header */}
          <div className="chatbot-header">
            <div>
              <span style={{ fontSize: '0.85rem' }}>🤖 Trợ Lý KP Luxury</span>
              <p style={{ fontSize: '0.7rem', opacity: 0.8, margin: '0.2rem 0 0' }}>Sẵn sàng giúp bạn 24/7</p>
            </div>
            <button onClick={() => setChatOpen(false)}>✕</button>
          </div>

          {/* Quick Suggestions (show if empty) */}
          {chatMessages.length === 1 && (
            <div className="chatbot-suggestions">
              {quickSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="suggestion-btn"
                  onClick={() => handleQuickSuggestion(suggestion.action)}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          )}

          {/* Messages Area */}
          <div className="chatbot-messages">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.from}`}>
                <span>{msg.text}</span>
                {msg.timestamp && (
                  <div className="chat-timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-msg bot">
                <span className="typing-indicator">
                  <span></span><span></span><span></span>
                </span>
              </div>
            )}

            <div ref={chatEndRef}></div>
          </div>

          {/* Input Area */}
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
            />
            <button onClick={handleSendChat} title="Gửi">📤</button>
            <button onClick={clearChat} title="Xóa lịch sử">🗑️</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
