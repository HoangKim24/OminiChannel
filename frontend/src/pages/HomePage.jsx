import Hero from '../components/user/Hero'
import ProductsSection from '../components/user/ProductsSection'
import { useAppStore } from '../store/useAppStore'

const HomePage = ({ resetQuiz }) => {
  const channels = useAppStore(state => state.channels)

  return (
    <div className="home-page">
      {/* Hero */}
      <Hero resetQuiz={resetQuiz} />

      {/* Products */}
      <ProductsSection />

      {/* Sales Channels Section */}
      <section className="products-section" style={{ background: '#080808', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <h2 className="section-title">
            <span>Trải Nghiệm Đa Kênh</span>
            Kênh Bán Hàng Trực Tuyến
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            {channels.map(channel => (
              <div key={channel.id} style={{ textAlign: 'center', cursor: 'pointer', transition: 'transform 0.3s' }} className="channel-logo-hover">
                <img src={channel.channelName === 'Lazada' ? 'https://upload.wikimedia.org/wikipedia/commons/d/df/Lazada_Logo.png' : channel.logoUrl} 
                  alt={channel.channelName} style={{ width: '64px', height: '64px', marginBottom: '1rem', objectFit: 'contain' }} 
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${channel.channelName}&background=222&color=c5a059` }} />
                <p style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 600 }}>{channel.channelName}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
