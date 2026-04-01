import { useState } from 'react';
const InventoryTab = ({ products }) => {
  const [showTransfer, setShowTransfer] = useState(false);

  const lowStockProducts = products?.filter(p => (p.stockQuantity || 0) < 10) || [];

   return (
      <div className="fade-in admin-tab inventory-tab">
         <div className="admin-tab-head-only">
            <h2 className="brand-font admin-tab-title">Quản Trị Tồn Kho O2O</h2>
            <p className="admin-tab-subtitle">
          Tối ưu hóa chuỗi cung ứng và điều chuyển hàng hóa giữa các showroom LUXURY.
        </p>
      </div>

         <div className="inventory-kpi-grid">
         <div className="glass-panel shadow-gold">
            <div className="inventory-kpi-label">Tổng Tồn Kho (SKUs)</div>
            <div className="brand-font inventory-kpi-value">
               {(products?.reduce((s, p) => s + (p.stockQuantity || 0), 0) || 0).toLocaleString()}
            </div>
            <div className="inventory-kpi-note">Hệ thống 12 chi nhánh toàn quốc</div>
         </div>
         <div className="glass-panel shadow-gold">
            <div className="inventory-kpi-label">Giá Trị Tồn Kho (Vốn)</div>
            <div className="brand-font inventory-kpi-value">
               ~ {((products?.reduce((s, p) => s + (p.stockQuantity || 0) * (p.price || 0), 0) || 0) / 1000000000).toFixed(1)}B
            </div>
            <div className="inventory-kpi-note">Ước tính theo giá niêm yết (VNĐ)</div>
         </div>
         <div className="glass-panel shadow-gold inventory-kpi-alert">
            <div className="inventory-kpi-alert-label">Cảnh Báo Tồn Kho Thấp</div>
            <div className="brand-font inventory-kpi-alert-value">{lowStockProducts.length} SP</div>
            <div className="inventory-kpi-alert-note">CẦN NHẬP HÀNG KHẨN CẤP</div>
         </div>
      </div>

      <div className="inventory-main-grid">
         <div className="glass-panel">
            <div className="inventory-section-head">
               <h3 className="brand-font inventory-section-title">📍 Phân Bổ Showroom & Kho Tổng</h3>
               <button className="luxury-button-gold inventory-quick-action" onClick={() => setShowTransfer(true)}>⚡ ĐIỀU CHUYỂN NHANH</button>
            </div>
            
            <div className="inventory-location-grid">
               {[
                 { node: 'Kho Tổng (Central WH)', type: 'Warehouse', stock: 8400, capacity: '65%', color: 'var(--admin-gold)' },
                 { node: 'KP Luxury Quận 1', type: 'Showroom', stock: 1200, capacity: '85%', color: '#27ae60' },
                 { node: 'KP Luxury Hoàn Kiếm', type: 'Showroom', stock: 950, capacity: '92%', color: '#e74c3c' },
                 { node: 'KP Luxury Đà Nẵng', type: 'Showroom', stock: 150, capacity: '12%', color: '#3498db' },
               ].map(loc => (
                 <div key={loc.node} className="inventory-location-card" style={{ borderLeft: `4px solid ${loc.color}` }}>
                    <div className="inventory-location-row">
                       <span className="inventory-location-name">{loc.node}</span>
                       <span className="luxury-badge" style={{ color: loc.color }}>{loc.type}</span>
                    </div>
                    <div className="brand-font inventory-location-stock">{loc.stock.toLocaleString()} <span className="inventory-location-unit">sp</span></div>
                    <div className="inventory-capacity-track">
                       <div className="inventory-capacity-fill" style={{ width: loc.capacity, background: loc.color, boxShadow: `0 0 10px ${loc.color}` }}></div>
                    </div>
                    <div className="inventory-capacity-meta">
                       <span className="inventory-capacity-label">TẢI TRỌNG: {loc.capacity}</span>
                       <span style={{ color: loc.color, fontWeight: '700' }}>TÌNH TRẠNG: {parseInt(loc.capacity) > 90 ? 'CRITICAL' : 'OPTIMAL'}</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="glass-panel">
            <h3 className="brand-font inventory-section-title inventory-log-title">📜 Nhật Ký Kho Vận</h3>
            <div className="inventory-log-list">
               {[
                 { date: '19/03, 09:12', msg: 'Nhập 500 chai Bleu de Chanel SP', p: '+500', loc: 'Kho Tổng' },
                 { date: '18/03, 14:45', msg: 'Xuất 50 chai Dior Sauvage', p: '-50', loc: 'Showroom Q1' },
                 { date: '17/03, 11:30', msg: 'Nhập nội bộ (Transfer)', p: '+20', loc: 'Showroom HN' },
               ].map((log, i) => (
                  <div key={i} className="inventory-log-item">
                     <div className="inventory-log-row">
                        <span className="inventory-log-date">{log.date}</span>
                        <strong className={`inventory-log-amount ${log.p.startsWith('+') ? 'inventory-increase' : 'inventory-decrease'}`}>{log.p}</strong>
                     </div>
                     <div className="inventory-log-msg">{log.msg}</div>
                     <div className="inventory-log-loc">Vị trí: {log.loc}</div>
                  </div>
               ))}
               <button className="luxury-input-field inventory-log-more">XEM TOÀN BỘ LỊCH SỬ</button>
            </div>
         </div>
      </div>

      {/* Low Stock Alert Section */}
      {lowStockProducts.length > 0 && (
         <div className="glass-panel shadow-gold" style={{ marginTop: '2rem', padding: '1.5rem', borderLeft: '4px solid #e74c3c' }}>
            <h3 className="brand-font" style={{ color: '#e74c3c', marginBottom: '1rem', fontSize: '1.2rem' }}>
               ⚠️ SẢN PHẨM TỒN KHO THẤP ({lowStockProducts.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
               {lowStockProducts.map((p, i) => (
                  <div key={i} style={{ padding: '1rem', background: 'rgba(231, 76, 60, 0.08)', border: '1px solid rgba(231, 76, 60, 0.2)', borderRadius: '8px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                           <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{p.name}</div>
                           <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.brand} - {p.concentration || 'EDP'}</div>
                        </div>
                        <div style={{ color: '#e74c3c', fontWeight: '700', fontSize: '1.3rem' }}>
                           {p.stockQuantity || 0}
                        </div>
                     </div>
                     <div style={{ fontSize: '0.75rem', color: '#e74c3c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
                        CẦN NHẬP NGAY
                     </div>
                     <button style={{ width: '100%', padding: '0.6rem', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>
                        NHẬP HÀNG
                     </button>
                  </div>
               ))}
            </div>
         </div>
      )}

      {showTransfer && (
         <div className="admin-modal-overlay">
            <div className="glass-panel shadow-gold fade-in admin-transfer-modal">
               <h3 className="brand-font admin-modal-title">Điều Chuyển Nội Bộ</h3>
               <div className="admin-modal-form">
                  <div className="input-group">
                     <label className="admin-field-label">SẢN PHẨM</label>
                     <select className="luxury-input-field admin-field-full">
                        <option>Dior Sauvage - 100ml</option>
                        <option>Bleu de Chanel - 100ml</option>
                     </select>
                  </div>
                  <div className="admin-form-grid-2">
                     <div className="input-group">
                        <label className="admin-field-label">TỪ (SOURCE)</label>
                        <select className="luxury-input-field admin-field-full"><option>Kho Tổng</option></select>
                     </div>
                     <div className="input-group">
                        <label className="admin-field-label">ĐẾN (TARGET)</label>
                        <select className="luxury-input-field admin-field-full"><option>KP Luxury Q1</option></select>
                     </div>
                  </div>
                  <div className="input-group">
                     <label className="admin-field-label">SỐ LƯỢNG (SLOT)</label>
                     <input type="number" className="luxury-input-field admin-field-full" defaultValue="20" />
                  </div>
                           <div className="admin-modal-actions admin-modal-actions-vertical">
                    <button className="luxury-button-gold" onClick={() => setShowTransfer(false)}>XÁC NHẬN LỆNH ĐIỀU CHUYỂN</button>
                    <button className="luxury-input-field" style={{ border: 'none' }} onClick={() => setShowTransfer(false)}>HỦY BỎ</button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default InventoryTab;

