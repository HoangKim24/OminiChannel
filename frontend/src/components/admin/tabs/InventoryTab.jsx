import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const InventoryTab = ({ products, channelProducts, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/statistics/inventory`, {
          headers: {
            'X-User-Role': user?.role || 'Admin',
            ...(user?.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {}),
          },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.message || 'Không thể tải dữ liệu kho từ database');
        }

        setInventoryData(data);
      } catch (err) {
        console.error('Load inventory from API failed:', err);
        setInventoryData(null);
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, [user?.accessToken, user?.role]);

  const sourceProducts = inventoryData?.products || products || [];
  const sourceChannels = inventoryData?.channels || [];

  const lowStockProducts = sourceProducts.filter((product) => (product.stockQuantity || 0) < 10);

  const totalStock = inventoryData?.totalStock ?? sourceProducts.reduce((sum, product) => sum + (product.stockQuantity || 0), 0);
  const totalValue = inventoryData?.totalValue ?? sourceProducts.reduce((sum, product) => sum + (product.stockQuantity || 0) * (product.price || 0), 0);
  const activeChannels = inventoryData?.activeChannels ?? sourceChannels.filter((channel) => (channel.activeListings || 0) > 0).length;
  const totalListings = inventoryData?.totalListings ?? (channelProducts || []).length;

  const channelSummary = useMemo(() => {
    if (inventoryData?.channels?.length) {
      return inventoryData.channels.map((channel) => ({
        name: channel.channelName,
        total: channel.totalListings || 0,
        active: channel.activeListings || 0,
        latestSync: channel.lastSyncedAt ? new Date(channel.lastSyncedAt) : null,
        items: (channelProducts || [])
          .filter((entry) => {
            const channelName = entry.salesChannel?.channelName || entry.salesChannel?.ChannelName;
            return channelName === channel.channelName;
          })
          .slice(0, 3)
          .map((entry) => ({
            id: entry.id,
            perfumeName: entry.perfume?.name || 'Sản phẩm',
            concentration: entry.perfume?.concentration || 'EDP',
            channelPrice: entry.channelPrice || entry.perfume?.price || 0,
            isListed: entry.isListed,
          })),
      }));
    }

    const groups = new Map();

    (channelProducts || []).forEach((entry) => {
      const channel = entry.salesChannel?.channelName || entry.salesChannel?.ChannelName || 'Kênh chưa rõ';
      const perfume = entry.perfume || {};

      if (!groups.has(channel)) {
        groups.set(channel, {
          name: channel,
          total: 0,
          active: 0,
          latestSync: null,
          items: [],
        });
      }

      const group = groups.get(channel);
      group.total += 1;
      if (entry.isListed) group.active += 1;

      const syncedAt = entry.lastSyncedAt ? new Date(entry.lastSyncedAt) : null;
      if (syncedAt && (!group.latestSync || syncedAt > group.latestSync)) {
        group.latestSync = syncedAt;
      }

      group.items.push({
        id: entry.id,
        perfumeName: perfume.name || 'Sản phẩm',
        concentration: perfume.concentration || 'EDP',
        channelPrice: entry.channelPrice || perfume.price || 0,
        isListed: entry.isListed,
      });
    });

    return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [channelProducts, inventoryData?.channels]);

  const filteredLowStockProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return lowStockProducts.filter((product) => {
      const matchesQuery = !query || [product.name, product.brand, product.concentration]
        .some((field) => String(field || '').toLowerCase().includes(query));
      return matchesQuery;
    });
  }, [lowStockProducts, searchQuery]);

  const visibleChannelSummary = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return channelSummary;

    return channelSummary
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          [group.name, item.perfumeName, item.concentration]
            .some((field) => String(field || '').toLowerCase().includes(query))
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [channelSummary, searchQuery]);

  const displayedLowStockProducts = showLowStockOnly ? filteredLowStockProducts : lowStockProducts;

  return (
    <div className="fade-in admin-tab inventory-tab">
      <div className="admin-tab-head-only">
        <h2 className="brand-font admin-tab-title">Quản lý tồn kho</h2>
        <p className="admin-tab-subtitle">
          Dữ liệu kho được lấy trực tiếp từ database, gồm Perfumes, SalesChannels và ChannelProducts.
        </p>
      </div>

      <div className="admin-tab-actions" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="luxury-input-field"
          placeholder="🔍 Tìm sản phẩm, thương hiệu hoặc kênh bán..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ minWidth: '280px', flex: '1' }}
        />
        <button className="luxury-button-gold" type="button" onClick={() => setShowLowStockOnly((value) => !value)}>
          {showLowStockOnly ? 'Hiện tất cả' : 'Chỉ hàng sắp hết'}
        </button>
      </div>

      <div className="inventory-kpi-grid">
        <div className="glass-panel shadow-gold">
          <div className="inventory-kpi-label">Tổng tồn kho</div>
          <div className="brand-font inventory-kpi-value">{totalStock.toLocaleString()}</div>
          <div className="inventory-kpi-note">Từ bảng Perfumes trong database</div>
        </div>
        <div className="glass-panel shadow-gold">
          <div className="inventory-kpi-label">Giá trị tồn kho</div>
          <div className="brand-font inventory-kpi-value">~ {(Number(totalValue) / 1000000000).toFixed(1)}B</div>
          <div className="inventory-kpi-note">Ước tính theo giá niêm yết (VND)</div>
        </div>
        <div className="glass-panel shadow-gold inventory-kpi-alert">
          <div className="inventory-kpi-alert-label">Tồn kho thấp</div>
          <div className="brand-font inventory-kpi-alert-value">{lowStockProducts.length} SP</div>
          <div className="inventory-kpi-alert-note">Cần nhập hàng khẩn cấp</div>
        </div>
        <div className="glass-panel shadow-gold">
          <div className="inventory-kpi-label">Kênh đang hoạt động</div>
          <div className="brand-font inventory-kpi-value">{activeChannels}</div>
          <div className="inventory-kpi-note">{totalListings} listing trong ChannelProducts</div>
        </div>
      </div>

      <div className="inventory-main-grid">
        <div className="glass-panel">
          <div className="inventory-section-head">
            <h3 className="brand-font inventory-section-title">Danh sách đang bán theo kênh</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {loading ? 'Đang tải dữ liệu từ database...' : 'Dữ liệu được đồng bộ trực tiếp từ DB.'}
            </div>
            <button type="button" className="luxury-input-field admin-mini-btn" onClick={() => window.location.reload()}>
              Tải lại
            </button>
          </div>

          <div className="inventory-location-grid">
            {visibleChannelSummary.length === 0 ? (
              <div className="admin-empty-cell" style={{ gridColumn: '1 / -1' }}>
                Không có dữ liệu kênh phù hợp với bộ lọc hiện tại.
              </div>
            ) : visibleChannelSummary.map((group) => (
              <div key={group.name} className="inventory-location-card" style={{ borderLeft: '4px solid var(--admin-gold)' }}>
                <div className="inventory-location-row">
                  <span className="inventory-location-name">{group.name}</span>
                  <span className="luxury-badge">{group.active}/{group.total} listing</span>
                </div>
                <div className="brand-font inventory-location-stock">
                  {group.active} <span className="inventory-location-unit">đang bán</span>
                </div>
                <div className="inventory-capacity-track">
                  <div
                    className="inventory-capacity-fill"
                    style={{
                      width: `${group.total > 0 ? Math.round((group.active / group.total) * 100) : 0}%`,
                      background: 'var(--admin-gold)',
                      boxShadow: '0 0 10px var(--admin-gold)',
                    }}
                  />
                </div>
                <div className="inventory-capacity-meta">
                  <span className="inventory-capacity-label">Đang bán: {group.active}</span>
                  <span style={{ color: 'var(--admin-gold)', fontWeight: '700' }}>
                    Đồng bộ: {group.latestSync ? group.latestSync.toLocaleDateString('vi-VN') : 'Chưa có'}
                  </span>
                </div>
                <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
                  {group.items.slice(0, 3).map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>{item.perfumeName} · {item.concentration}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{(item.channelPrice || 0).toLocaleString()} đ</span>
                    </div>
                  ))}
                  {group.items.length > 3 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>... và {group.items.length - 3} listing khác</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel">
          <h3 className="brand-font inventory-section-title inventory-log-title">Sản phẩm tồn kho thấp</h3>
          <div className="inventory-log-list">
            {filteredLowStockProducts.length === 0 ? (
              <div className="admin-empty-cell">Không có sản phẩm nào dưới ngưỡng cảnh báo.</div>
            ) : filteredLowStockProducts.map((product) => (
              <div key={product.id} className="inventory-log-item">
                <div className="inventory-log-row">
                  <span className="inventory-log-date">{product.brand || 'KP Luxury'}</span>
                  <strong className="inventory-log-amount inventory-decrease">{product.stockQuantity || 0}</strong>
                </div>
                <div className="inventory-log-msg">Tồn kho: {product.name}</div>
                <div className="inventory-log-loc">Nồng độ: {product.concentration || 'EDP'}</div>
              </div>
            ))}
            <div className="inventory-log-more" style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
              Dữ liệu kênh bán được lấy trực tiếp từ database.
            </div>
          </div>
        </div>
      </div>

      {displayedLowStockProducts.length > 0 && (
        <div className="glass-panel shadow-gold" style={{ marginTop: '2rem', padding: '1.5rem', borderLeft: '4px solid #e74c3c' }}>
          <h3 className="brand-font" style={{ color: '#e74c3c', marginBottom: '1rem', fontSize: '1.2rem' }}>
            Sản phẩm tồn kho thấp ({displayedLowStockProducts.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {displayedLowStockProducts.map((product) => (
              <div key={product.id} style={{ padding: '1rem', background: 'rgba(231, 76, 60, 0.08)', border: '1px solid rgba(231, 76, 60, 0.2)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{product.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.brand} - {product.concentration || 'EDP'}</div>
                  </div>
                  <div style={{ color: '#e74c3c', fontWeight: '700', fontSize: '1.3rem' }}>{product.stockQuantity || 0}</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#e74c3c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
                  Cần nhập ngay
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTab;
