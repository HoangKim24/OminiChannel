import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore'
import { useNavigate } from 'react-router-dom'

const ProfilePage = () => {
  const navigate = useNavigate()
  const user = useAppStore(state => state.user)
  const orders = useAppStore(state => state.orders)
  const loadingOrders = useAppStore(state => state.loadingOrders)
  const fetchOrders = useAppStore(state => state.fetchOrders)
  
  const vnd = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * 24000)

  useEffect(() => {
    if (!user) {
      navigate('/')
    } else {
      fetchOrders()
    }
  }, [user, fetchOrders, navigate])

  if (!user) return null

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px', minHeight: '70vh' }}>
      <h2 className="section-title">
        <span>Hành trình của bạn</span>
        Lịch sử mua hàng
      </h2>
      
      <div style={{ marginTop: '2rem', display: 'grid', gap: '2rem' }}>
        {loadingOrders ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Đang tải lịch sử đơn hàng...</p>
        ) : orders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Bạn chưa có đơn hàng nào.</p>
        ) : (
          orders.map(order => {
            const items = order.items || order.Items || []
            const total = order.totalAmount ?? order.TotalAmount ?? 0
            return (
              <div key={order.id} className="product-card" style={{ padding: '1.5rem', border: '1px solid #333', cursor: 'pointer' }} onClick={() => navigate(`/order/${order.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #222', paddingBottom: '1rem' }}>
                  <h3 className="brand-font">Đơn hàng #{order.id}</h3>
                  <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', padding: '0.2rem 0.8rem', background: '#222', borderRadius: '12px', height: 'fit-content' }}>
                    {order.status || order.Status || 'Chờ xác nhận'}
                  </span>
                </div>
                <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Ngày đặt: {order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
                <p style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '0.75rem' }}>{vnd(total)}</p>
                {items.length > 0 && (
                  <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '1rem', color: '#aaa', fontSize: '0.9rem' }}>
                    {items.slice(0, 2).map((item, i) => (
                      <li key={i} style={{ marginBottom: '0.5rem' }}>
                        {item.perfumeName || item.PerfumeName} - {vnd((item.price || item.Price || 0) * (item.quantity || item.Quantity || 1))}
                      </li>
                    ))}
                    {items.length > 2 && <li style={{ color: '#666', marginTop: '0.75rem' }}>... và {items.length - 2} sản phẩm khác</li>}
                  </ul>
                )}
                <button style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--accent-gold)', background: 'transparent', border: '1px solid var(--accent-gold)', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Xem chi tiết</button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ProfilePage

