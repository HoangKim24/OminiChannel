import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useNavigate } from 'react-router-dom';

const quizQuestions = [
  { id: 'gender', q: 'Bạn đang tìm mùi hương cho ai?', options: [['Nam', 'Dành cho Nam'], ['Nữ', 'Dành cho Nữ'], ['Unisex', 'Mùi Unisex']] },
  { id: 'family', q: 'Bạn thích nhóm hương nào nhất?', options: [['hoa', 'Hương Hoa (Floral)'], ['gỗ', 'Hương Gỗ (Woody)'], ['tươi mát', 'Tươi Mát (Fresh)']] },
  { id: 'vibe', q: 'Bạn thường dùng nước hoa khi nào?', options: [['daily', 'Đi làm hàng ngày'], ['date', 'Hẹn hò lãng mạn'], ['party', 'Tiệc tùng nổi bật']] }
];

const QuizModal = () => {
  const quizOpen = useAppStore(state => state.quizOpen);
  const setQuizOpen = useAppStore(state => state.setQuizOpen);
  const products = useAppStore(state => state.products);
  const navigate = useNavigate();

  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState([]);

  if (!quizOpen) return null;

  const handleQuizAnswer = (questionId, value) => {
    const newAnswers = { ...quizAnswers, [questionId]: value };
    setQuizAnswers(newAnswers);

    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate matching
      const scored = products.map(p => {
        let score = 0;
        const targetDesc = (p.description + p.name).toLowerCase();
        if (p.gender === newAnswers.gender) score += 40;
        if (newAnswers.family === 'hoa' && (p.categoryId === 1 || targetDesc.includes('hoa') || targetDesc.includes('floral'))) score += 30;
        if (newAnswers.family === 'gỗ' && (p.categoryId === 2 || targetDesc.includes('gỗ') || targetDesc.includes('wood'))) score += 30;
        if (newAnswers.family === 'tươi mát' && (p.categoryId === 3 || targetDesc.includes('tươi') || targetDesc.includes('fresh'))) score += 30;
        if (newAnswers.vibe === 'party' && (p.concentration === 'Parfum' || p.concentration === 'Extrait')) score += 20;
        if (newAnswers.vibe === 'daily' && (p.concentration === 'EDT' || targetDesc.includes('nhẹ'))) score += 20;
        if (newAnswers.vibe === 'date' && targetDesc.includes('lãng mạn')) score += 20;
        return { ...p, matchScore: score };
      });
      const topMatches = scored.filter(p => p.matchScore >= 40).sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
      setQuizResults(topMatches);
      setQuizStep(quizStep + 1);
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers({});
    setQuizResults([]);
  };

  const closeQuiz = () => {
    setQuizOpen(false);
    resetQuiz();
  };

  return (
    <div className="quiz-overlay" onClick={closeQuiz}>
      <div className="quiz-modal" onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid var(--glass-border)', padding: '3rem', borderRadius: '12px', textAlign: 'center', width: '90%', maxWidth: '800px', margin: 'auto' }}>
        <button className="icon-btn" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '1.5rem' }} onClick={closeQuiz}>✕</button>
        {quizStep < quizQuestions.length ? (
          <div key={quizStep} className="fade-in">
            <p style={{ color: 'var(--accent-gold)', marginBottom: '1rem', letterSpacing: '2px' }}>CÂU HỎI {quizStep + 1}/{quizQuestions.length}</p>
            <h3 className="brand-font" style={{ fontSize: '2rem', marginBottom: '2.5rem' }}>{quizQuestions[quizStep].q}</h3>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              {quizQuestions[quizStep].options.map(([val, label]) => (
                <button key={val} className="btn-gold" style={{ background: 'transparent', border: '1px solid #333', color: '#fff' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#333'}
                  onClick={() => handleQuizAnswer(quizQuestions[quizStep].id, val)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="fade-in">
            <h3 className="brand-font" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Sản Phẩm Dành Cho Bạn</h3>
            <p style={{ color: '#888', marginBottom: '3rem' }}>Dựa trên sở thích cá nhân, đây là những mùi hương chúng tôi gợi ý:</p>
            <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
              {quizResults.map(p => (
                <div key={p.id} className="product-card" style={{ padding: '0.5rem' }}>
                  <div className="product-image-container" onClick={() => { navigate(`/product/${p.id}`); closeQuiz(); }} style={{ aspectRatio: '1/1', marginBottom: '1rem' }}>
                    <img src={p.imageUrl} alt={p.name} className="product-image" />
                  </div>
                  <h4 className="brand-font">{p.name}</h4>
                  <p style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>{p.matchScore}% Phù Hợp</p>
                  <button className="btn-gold" style={{ width: '100%', padding: '0.6rem', marginTop: '1rem', fontSize: '0.75rem' }} onClick={() => { navigate(`/product/${p.id}`); closeQuiz(); }}>Chi Tiết</button>
                </div>
              ))}
            </div>
            <button className="btn-gold" style={{ marginTop: '4rem' }} onClick={resetQuiz}>Làm Lại Trắc Nghiệm</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;

