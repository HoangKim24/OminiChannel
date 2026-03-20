import React, { useState, useEffect } from 'react';
import { vnd } from '../../../utils/format';

const CrmTab = ({ orders, user }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/statistics/customers', {
          headers: { 'X-User-Role': user?.role || 'Admin' }
        });
        if (res.ok) {
          setCustomers(await res.json());
        }
      } catch (err) { console.error('CRM fetch error:', err); }
      finally { setLoading(false); }
    };
    fetchCustomers();
  }, [user, orders]);

  const getTierColor = (totalSpend) => {
    if (totalSpend >= 50000000) return '#e5e4e2'; // Platin
    if (totalSpend >= 10000000) return 'var(--admin-gold)'; // Gold
    if (totalSpend >= 5000000) return '#bdc3c7'; // Silver
    return '#888';
  };

  const getTier = (totalSpend) => {
    if (totalSpend >= 50000000) return 'VIP Platin';
    if (totalSpend >= 10000000) return 'Gold';
    if (totalSpend >= 5000000) return 'Silver';
    return 'Member';
  };

  return (
    <div className="fade-in">
       <div style={{ marginBottom: '3rem' }}>
          <h2 className="brand-font" style={{ fontSize: '2rem', color: 'var(--admin-gold)' }}>Quản Trị Khách Hàng (CRM)</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', letterSpacing: '0.5px' }}>
             Xây dựng mối quan hệ bền vững với tầng lớp khách hàng tinh hoa.
          </p>
       </div>

       <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
             <h3 className="brand-font" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>💎 Đặc Quyền VIP</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { label: 'Miễn phí vận chuyển hỏa tốc', active: true },
                  { label: 'Quà tặng sinh nhật cá nhân hóa', active: true },
                  { label: 'Trải nghiệm mùi hương mẫu mới nhất', active: true },
                  { label: 'Ưu tiên đặt hàng trước (Pre-order)', active: false },
                ].map((perk, i) => (
                   <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: perk.active ? 1 : 0.3 }}>
                      <div style={{ color: 'var(--admin-gold)' }}>{perk.active ? '✦' : '✧'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{perk.label}</div>
                   </div>
                ))}
             </div>
             <div style={{ marginTop: '2.5rem', padding: '1rem', background: 'rgba(197,160,89,0.05)', border: '1px solid var(--admin-border)' }}>
               <div style={{ fontSize: '0.65rem', color: 'var(--admin-gold)', letterSpacing: '2px', marginBottom: '0.5rem' }}>TỔNG KHÁCH HÀNG</div>
               <div className="brand-font" style={{ fontSize: '1.8rem' }}>{customers.length}</div>
             </div>
          </div>

          <div className="glass-panel shadow-gold" style={{ border: 'none', background: 'transparent', padding: 0 }}>
             <div className="table-container" style={{ background: 'rgba(10,10,10,0.5)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
                <table className="admin-table-modern" style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead style={{ background: 'rgba(197, 160, 89, 0.05)', borderBottom: '1px solid var(--admin-border)' }}>
                      <tr>
                         <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.65rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Khách Hàng</th>
                         <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.65rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Phân Hạng</th>
                         <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.65rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Chi Tiêu</th>
                         <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.65rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Thao Tác</th>
                      </tr>
                   </thead>
                   <tbody>
                      {loading ? (
                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Đang tải...</td></tr>
                      ) : customers.length > 0 ? (
                        customers.map(c => {
                          const tier = getTier(c.totalSpend);
                          return (
                            <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.3s' }} className="table-row-hover">
                               <td style={{ padding: '1.25rem' }}>
                                  <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>{c.fullName || c.username}</div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    #{c.id} | {c.orderCount} đơn | {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('vi-VN') : 'Chưa đặt hàng'}
                                  </div>
                               </td>
                               <td style={{ padding: '1.25rem' }}>
                                  <span className="luxury-badge" style={{ color: getTierColor(c.totalSpend), borderColor: getTierColor(c.totalSpend) }}>
                                     {tier}
                                  </span>
                               </td>
                               <td style={{ padding: '1.25rem' }}>
                                  <div style={{ color: '#fff', fontWeight: '700' }}>{vnd(c.totalSpend)}</div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--admin-gold)', marginTop: '4px' }}>{c.orderCount} ĐƠN HÀNG</div>
                               </td>
                               <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                  <button className="luxury-input-field" style={{ fontSize: '0.65rem', padding: '0.5rem 1rem' }} onClick={() => setSelectedCustomer(c)}>XEM HỒ SƠ</button>
                               </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Chưa có khách hàng nào.</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
       </div>

       {selectedCustomer && (
          <div style={{ marginTop: '3rem' }} className="fade-in">
             <div className="glass-panel" style={{ background: 'rgba(197, 160, 89, 0.02)', border: '1px solid var(--admin-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                   <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                      <div style={{ width: '80px', height: '80px', background: 'var(--admin-gold)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem', color: '#000' }}>
                         {(selectedCustomer.fullName || selectedCustomer.username || '?')[0].toUpperCase()}
                      </div>
                      <div>
                         <h3 className="brand-font" style={{ fontSize: '2rem', color: '#fff' }}>{selectedCustomer.fullName || selectedCustomer.username}</h3>
                         <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <span className="luxury-badge" style={{ color: getTierColor(selectedCustomer.totalSpend) }}>{getTier(selectedCustomer.totalSpend)} MEMBER</span>
                            {selectedCustomer.email && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedCustomer.email}</span>}
                         </div>
                      </div>
                   </div>
                   <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', color: '#555', fontSize: '2rem', cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--admin-border)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--admin-gold)', letterSpacing: '2px', marginBottom: '0.5rem' }}>TỔNG CHI TIÊU</div>
                    <div className="brand-font" style={{ fontSize: '1.5rem' }}>{vnd(selectedCustomer.totalSpend)}</div>
                  </div>
                  <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--admin-border)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--admin-gold)', letterSpacing: '2px', marginBottom: '0.5rem' }}>SỐ ĐƠN HÀNG</div>
                    <div className="brand-font" style={{ fontSize: '1.5rem' }}>{selectedCustomer.orderCount}</div>
                  </div>
                  <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--admin-border)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--admin-gold)', letterSpacing: '2px', marginBottom: '0.5rem' }}>ĐƠN GẦN NHẤT</div>
                    <div className="brand-font" style={{ fontSize: '1.5rem' }}>
                      {selectedCustomer.lastOrderDate ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString('vi-VN') : '—'}
                    </div>
                  </div>
                </div>

                {selectedCustomer.phoneNumber && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📱 SĐT: {selectedCustomer.phoneNumber}</p>
                )}
             </div>
          </div>
       )}
    </div>
  );
};

export default CrmTab;
