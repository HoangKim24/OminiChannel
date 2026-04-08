import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { vnd } from '../../../utils/format';
import './OverviewTab.css';

const shortMonthLabel = (date) => `T${date.getMonth() + 1}`;

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const parseOrderDate = (order) => {
  const raw =
    order?.createdAt ??
    order?.CreatedAt ??
    order?.orderDate ??
    order?.OrderDate ??
    order?.createdDate ??
    order?.CreatedDate;

  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildRevenueSeries = (orders, totalRevenue = 0) => {
  const now = new Date();
  const months = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - idx), 1);
    return {
      key: monthKey(d),
      month: shortMonthLabel(d),
      revenue: 0,
    };
  });

  const lookup = new Map(months.map((m) => [m.key, m]));
  let matchedOrders = 0;

  if (Array.isArray(orders)) {
    orders.forEach((order) => {
      const d = parseOrderDate(order);
      if (!d) return;

      const bucket = lookup.get(monthKey(d));
      if (!bucket) return;

      const amount = Number(order?.totalAmount ?? order?.TotalAmount ?? 0);
      bucket.revenue += Number.isFinite(amount) ? amount : 0;
      matchedOrders += 1;
    });
  }

  // Only use fallback if we have no matched orders AND no total revenue context
  if (matchedOrders === 0 && totalRevenue === 0) {
    // Return empty series instead of fallback distribution
    return months;
  }

  return months;
};

const normalizeSeries = (series) => {
  if (!Array.isArray(series) || series.length === 0) return [];

  return series
    .map((item, index) => {
      const month =
        item?.month ??
        item?.label ??
        (typeof item?.period === 'string' ? item.period : `T${index + 1}`);
      const revenue = Number(item?.revenue ?? item?.value ?? 0);

      return {
        month,
        revenue: Number.isFinite(revenue) ? revenue : 0,
      };
    })
    .slice(-7);
};

const OverviewLoadingState = () => (
  <div className="overview-loading" role="status" aria-live="polite">
    <div className="overview-skeleton-grid">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={`kpi-loading-${idx}`} className="overview-skeleton-card" />
      ))}
    </div>
    <div className="overview-skeleton-chart" />
  </div>
);

const OverviewTab = ({ products, orders, user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const userRole = String(user?.role || '').trim();
      const res = await fetch('/api/statistics/dashboard', {
        headers: {
          ...(userRole ? { 'X-User-Role': userRole } : {}),
          ...(user?.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {}),
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('DASHBOARD_UNAUTHORIZED');
        }
        const errData = await res.text();
        console.error(`Dashboard API error ${res.status}:`, errData);
        throw new Error(`Dashboard API error ${res.status}: ${errData.substring(0, 100)}`);
      }

      setDashboardData(await res.json());
    } catch (err) {
      if (err instanceof Error && err.message === 'DASHBOARD_UNAUTHORIZED') {
        setError('Ban khong co quyen xem dashboard admin. Vui long dang nhap tai khoan Admin.');
      } else {
        setError('Khong tai duoc du lieu realtime. Dang hien thi du lieu du phong.');
      }
      console.error('Dashboard fetch error:', err);
      console.warn('User role:', user?.role, '| Trimmed:', String(user?.role || '').trim());
    } finally {
      setIsLoading(false);
    }
  }, [user?.accessToken, user?.role]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const totalOrders = dashboardData?.totalOrders ?? (Array.isArray(orders) ? orders.length : 0);
  const totalRevenue = dashboardData?.totalRevenue ?? (Array.isArray(orders) ? orders.reduce((s, o) => s + (o.totalAmount ?? o.TotalAmount ?? 0), 0) : 0);
  const totalProducts = dashboardData?.totalProducts ?? (products?.length || 0);
  const totalCustomers = dashboardData?.totalCustomers ?? 0;
  const recentOrders = dashboardData?.recentOrders ?? [];
  const lowStockProducts = dashboardData?.lowStockProducts ?? [];

  const seriesFromApi = normalizeSeries(dashboardData?.revenueSeries);
  const revenueSeries = useMemo(() => {
    if (seriesFromApi.length > 0) {
      return seriesFromApi;
    }

    return buildRevenueSeries(orders, Number(totalRevenue) || 0);
  }, [orders, seriesFromApi, totalRevenue]);

  const hasRevenueData = revenueSeries.some((item) => item.revenue > 0);

  const stats = [
    { label: 'Tổng Doanh Thu', val: vnd(totalRevenue), icon: '💰', trend: totalOrders ? `+${totalOrders} đơn` : '—' },
    { label: 'Số Đơn Hàng', val: totalOrders.toString(), icon: '📦', trend: totalOrders ? 'Hoạt động' : 'Chưa có dữ liệu' },
    { label: 'Số Sản Phẩm', val: totalProducts.toString(), icon: '💎', trend: totalProducts ? 'Đang bán' : 'Chưa có sản phẩm' },
    { label: 'Khách Hàng', val: totalCustomers.toString(), icon: '🚀', trend: totalCustomers ? `${totalCustomers} tài khoản` : 'Chưa có khách' },
  ];

  const showLoading = isLoading && !dashboardData && (!Array.isArray(orders) || orders.length === 0);

  if (showLoading) {
    return (
      <section className="overview-tab fade-in">
        <OverviewLoadingState />
      </section>
    );
  }

  return (
    <section className="overview-tab fade-in">
      <header className="overview-header">
        <div>
          <h2 className="brand-font overview-title">📊 Toàn cảnh hệ thống</h2>
          <p className="overview-subtitle">Giám sát hiệu suất vận hành và doanh thu theo thời gian.</p>
        </div>
        <div className="overview-meta" aria-live="polite">
          <span className="overview-chip">📅 {new Date().toLocaleDateString('vi-VN')}</span>
          <span className="overview-chip">
            🔔 {lowStockProducts.length > 0 ? `${lowStockProducts.length} cảnh báo tồn kho` : 'Hệ thống ổn định'}
          </span>
        </div>
      </header>

      {error ? (
        <div className="overview-alert" role="alert">
          <span>{error}</span>
          <button type="button" className="overview-retry-btn" onClick={fetchDashboard}>
            Tải lại
          </button>
        </div>
      ) : null}

      <section className="overview-kpi-grid" aria-label="Dashboard KPI">
        {stats.map((s) => (
          <article key={s.label} className="overview-kpi-card admin-panel shadow-gold">
            <div className="overview-kpi-head">
              <span className="overview-kpi-icon" aria-hidden="true">{s.icon}</span>
              <span className="overview-kpi-trend">{s.trend}</span>
            </div>
            <p className="overview-kpi-value">{s.val}</p>
            <p className="overview-kpi-label">{s.label}</p>
          </article>
        ))}
      </section>

      <section className="overview-main-grid">
        <article className="overview-chart-card admin-panel">
          <div className="overview-card-head">
            <h3 className="brand-font overview-card-title">📈 Biểu đồ Doanh Thu</h3>
            <p className="overview-card-subtitle">7 tháng gần nhất</p>
          </div>

          <div className="overview-chart-shell">
            {hasRevenueData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueSeries} margin={{ top: 6, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#b5b5b5', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#b5b5b5', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                    tickLine={false}
                    width={72}
                    tickFormatter={(value) => `${Math.round(value / 1000000)}M`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(212, 175, 55, 0.08)' }}
                    contentStyle={{
                      background: '#121212',
                      border: '1px solid rgba(212, 175, 55, 0.45)',
                      borderRadius: '10px',
                      color: '#ffffff',
                    }}
                    formatter={(value) => [vnd(Number(value) || 0), 'Doanh thu']}
                    labelStyle={{ color: '#d7d7d7' }}
                  />
                  <Bar dataKey="revenue" fill="#d4af37" radius={[8, 8, 0, 0]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="overview-empty-state" role="status">
                <p>Chưa có dữ liệu doanh thu theo tháng để hiển thị biểu đồ.</p>
              </div>
            )}
          </div>
          <p className="overview-chart-note">Tổng doanh thu hiện tại: {vnd(totalRevenue)}</p>
        </article>
      </section>

      <section className="overview-secondary-grid">
        <article className="overview-table-card admin-panel">
          <h3 className="brand-font overview-card-title">🔔 Đơn Hàng Mới Nhất</h3>
          <div className="overview-table-wrap">
            <table className="overview-table">
              <thead>
                <tr>
                  <th>Mã Đơn</th>
                  <th>Khách Hàng</th>
                  <th>Trạng Thái</th>
                  <th>Tổng</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((o) => {
                    const normalizedStatus = String(o.status ?? '').toLowerCase();
                    return (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.customerName || 'Khách hàng'}</td>
                      <td>
                        <span className={normalizedStatus.includes('pending') ? 'overview-status-pending' : 'overview-status-processing'}>
                          {o.status || 'Đang xử lý'}
                        </span>
                      </td>
                      <td>{vnd(o.totalAmount)}</td>
                    </tr>
                    );
                  })
                ) : Array.isArray(orders) && orders.length > 0 ? (
                  orders.slice(0, 5).map((o) => {
                    const id = o.id ?? o.Id;
                    const status = o.status ?? o.Status ?? 'Chờ xử lý';
                    const amount = o.totalAmount ?? o.TotalAmount ?? 0;
                    return (
                      <tr key={id}>
                        <td>#{id}</td>
                        <td>Khách hàng</td>
                        <td>
                          <span className={status.includes('Chờ') || status.toLowerCase().includes('pending') ? 'overview-status-pending' : 'overview-status-processing'}>
                            {status}
                          </span>
                        </td>
                        <td>{vnd(amount)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="overview-empty-row">
                      Chưa có đơn hàng nào từ phía khách.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="overview-warnings-card admin-panel">
          <h3 className="brand-font overview-card-title">⚠️ Cảnh Báo Hệ Thống</h3>
          <div className="overview-warning-list">
             {lowStockProducts.length > 0 ? (
               lowStockProducts.map((p) => (
                 <div key={p.id} className="overview-warning-item is-danger">
                   <strong>Tồn kho thấp:</strong> {p.name} — còn {p.stockQuantity} sản phẩm.
                 </div>
               ))
             ) : (
               <div className="overview-warning-item is-safe">
                 <strong>✓ Tất cả sản phẩm đều đủ tồn kho.</strong>
               </div>
             )}
          </div>
        </article>
      </section>
    </section>
  );
};

export default OverviewTab;

