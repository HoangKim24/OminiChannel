import Hero from '../components/user/Hero'
import ProductsSection from '../components/user/ProductsSection'
import { useAppStore } from '../store/useAppStore'

const KNOWN_CHANNEL_LOGOS = {
  website: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f310.svg',
  shopee: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg',
  lazada: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Lazada_Logo.png',
  tiktok: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg',
}

const resolveChannelLogo = (channel) => {
  const channelName = String(channel?.channelName || '').trim().toLowerCase()

  if (channelName.includes('shopee')) return KNOWN_CHANNEL_LOGOS.shopee
  if (channelName.includes('lazada')) return KNOWN_CHANNEL_LOGOS.lazada
  if (channelName.includes('tiktok')) return KNOWN_CHANNEL_LOGOS.tiktok
  if (channelName.includes('website') || channelName.includes('web')) return KNOWN_CHANNEL_LOGOS.website

  return channel?.logoUrl || KNOWN_CHANNEL_LOGOS.website
}

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
          <div className="channel-grid">
            {channels.map(channel => (
              <div key={channel.id} className="channel-card channel-logo-hover">
                <div className="channel-logo-wrap">
                  <img
                    src={resolveChannelLogo(channel)}
                    alt={channel.channelName}
                    className="channel-logo"
                    onError={(e) => {
                      e.currentTarget.src = KNOWN_CHANNEL_LOGOS.website
                    }}
                  />
                </div>
                <p className="channel-name">{channel.channelName}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
