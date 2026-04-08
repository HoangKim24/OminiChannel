import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { vnd } from '../../../utils/format';
import './OverviewTab.css';

const REVENUE_MODES = [
  { value: 'day', label: 'Ngày' },
  { value: 'week', label: 'Tuần' },
  { value: 'month', label: 'Tháng' },
  { value: 'year', label: 'Năm' },
  { value: 'weekday', label: 'Ngày trong tuần' },
];

const shortMonthLabel = (date) => `T${date.getMonth() + 1}`;

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const toIsoDateInput = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const parseIsoDateInput = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getIsoWeekInfo = (date) => {
  const workingDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = workingDate.getUTCDay() || 7;
  workingDate.setUTCDate(workingDate.getUTCDate() + 4 - dayNumber);
  const isoYear = workingDate.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil((((workingDate - yearStart) / 86400000) + 1) / 7);

  return { isoYear, isoWeek: week };
};

const toWeekInputValue = (date) => {
  const { isoYear, isoWeek } = getIsoWeekInfo(date);
  return `${isoYear}-W${String(isoWeek).padStart(2, '0')}`;
};

const parseWeekInputToRange = (weekValue) => {
  const match = /^(\d{4})-W(\d{2})$/.exec(weekValue || '');
  if (!match) return null;

  const isoYear = Number(match[1]);
  const isoWeek = Number(match[2]);
  if (!Number.isInteger(isoYear) || !Number.isInteger(isoWeek) || isoWeek < 1 || isoWeek > 53) {
    return null;
  }

  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4IsoDay = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4IsoDay - 1));

  const fromDate = new Date(week1Monday);
  fromDate.setUTCDate(week1Monday.getUTCDate() + (isoWeek - 1) * 7);

  const toDate = new Date(fromDate);
  toDate.setUTCDate(fromDate.getUTCDate() + 6);

  return {
    from: toIsoDateInput(fromDate),
    to: toIsoDateInput(toDate),
  };
};

const getCurrentWeekRange = () => {
  const now = new Date();
  const utcDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const isoDay = utcDate.getUTCDay() || 7;
  const monday = new Date(utcDate);
  monday.setUTCDate(utcDate.getUTCDate() - (isoDay - 1));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return {
    from: toIsoDateInput(monday),
    to: toIsoDateInput(sunday),
    week: toWeekInputValue(monday),
  };
};

const getCurrentMonthRange = () => {
  const now = new Date();
  const from = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const to = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));
  return {
    from: toIsoDateInput(from),
    to: toIsoDateInput(to),
  };
};

const getDefaultRevenueFilters = () => {
  const now = new Date();
  const week = getCurrentWeekRange();
  const monthRange = getCurrentMonthRange();

  return {
    mode: 'month',
    from: monthRange.from,
    to: monthRange.to,
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    year: String(now.getFullYear()),
    week: week.week,
    weekFrom: week.from,
    weekTo: week.to,
  };
};

const getDayRangePreset = (days) => {
  const now = new Date();
  const utcToday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const fromDate = new Date(utcToday);
  fromDate.setUTCDate(utcToday.getUTCDate() - (days - 1));

  return {
    from: toIsoDateInput(fromDate),
    to: toIsoDateInput(utcToday),
  };
};

const getCurrentMonthValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getCurrentYearValue = () => {
  return String(new Date().getFullYear());
};

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
      label: shortMonthLabel(d),
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
      const label =
        item?.label ??
        item?.month ??
        item?.label ??
        (typeof item?.period === 'string' ? item.period : `T${index + 1}`);
      const revenue = Number(item?.revenue ?? item?.value ?? 0);

      return {
        label,
        revenue: Number.isFinite(revenue) ? revenue : 0,
      };
    })
    .slice(-7);
};

const getRevenueSubtitle = (mode) => {
  switch (mode) {
    case 'day':
      return 'Doanh thu theo từng ngày trong khoảng đã chọn';
    case 'week':
      return 'Doanh thu theo 7 ngày Mon-Sun';
    case 'month':
      return 'Doanh thu theo ngày trong tháng đã chọn';
    case 'year':
      return 'Doanh thu theo 12 tháng trong năm';
    case 'weekday':
      return 'Phân bổ doanh thu theo ngày trong tuần (Mon-Sun)';
    default:
      return 'Doanh thu theo thời gian';
  }
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
  const [revenueFilters, setRevenueFilters] = useState(getDefaultRevenueFilters);
  const [revenueData, setRevenueData] = useState(null);
  const [isRevenueLoading, setIsRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState('');

  const validateRevenueFilters = useCallback(() => {
    const mode = revenueFilters.mode;

    if (mode === 'year') {
      const parsedYear = Number(revenueFilters.year);
      if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
        return 'Năm không hợp lệ (2000-2100).';
      }
      return '';
    }

    if (mode === 'month') {
      if (!/^\d{4}-\d{2}$/.test(revenueFilters.month || '')) {
        return 'Tháng phải theo định dạng YYYY-MM.';
      }
      return '';
    }

    const fromValue = mode === 'week' ? revenueFilters.weekFrom : revenueFilters.from;
    const toValue = mode === 'week' ? revenueFilters.weekTo : revenueFilters.to;

    const fromDate = parseIsoDateInput(fromValue);
    const toDate = parseIsoDateInput(toValue);
    if (!fromDate || !toDate) {
      return 'Vui lòng nhập đầy đủ ngày bắt đầu và kết thúc.';
    }

    if (fromDate > toDate) {
      return 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.';
    }

    if (mode === 'week') {
      const days = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
      if (days !== 7) {
        return 'Thống kê tuần yêu cầu đúng 7 ngày (Mon-Sun).';
      }
    }

    return '';
  }, [revenueFilters]);

  const fetchRevenue = useCallback(async (filtersToUse) => {
    const selected = filtersToUse || revenueFilters;

    const params = new URLSearchParams();
    params.set('mode', selected.mode);

    if (selected.mode === 'year') {
      params.set('year', selected.year);
    } else if (selected.mode === 'month') {
      params.set('month', selected.month);
    } else if (selected.mode === 'week') {
      params.set('from', selected.weekFrom);
      params.set('to', selected.weekTo);
    } else {
      params.set('from', selected.from);
      params.set('to', selected.to);
    }

    setIsRevenueLoading(true);
    setRevenueError('');

    try {
      const userRole = String(user?.role || '').trim();
      const res = await fetch(`/api/statistics/revenue?${params.toString()}`, {
        headers: {
          ...(userRole ? { 'X-User-Role': userRole } : {}),
          ...(user?.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {}),
        },
      });

      if (!res.ok) {
        let message = 'Không tải được thống kê doanh thu';
        try {
          const errJson = await res.json();
          if (errJson?.message) message = errJson.message;
        } catch {
          const errText = await res.text();
          if (errText) message = errText;
        }
        throw new Error(message);
      }

      setRevenueData(await res.json());
    } catch (err) {
      setRevenueError(err instanceof Error ? err.message : 'Không tải được thống kê doanh thu');
    } finally {
      setIsRevenueLoading(false);
    }
  }, [revenueFilters, user?.accessToken, user?.role]);

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

  useEffect(() => {
    fetchRevenue(getDefaultRevenueFilters());
  }, [fetchRevenue]);

  const totalOrders = dashboardData?.totalOrders ?? (Array.isArray(orders) ? orders.length : 0);
  const totalRevenue = dashboardData?.totalRevenue ?? (Array.isArray(orders) ? orders.reduce((s, o) => s + (o.totalAmount ?? o.TotalAmount ?? 0), 0) : 0);
  const totalProducts = dashboardData?.totalProducts ?? (products?.length || 0);
  const totalCustomers = dashboardData?.totalCustomers ?? 0;
  const recentOrders = dashboardData?.recentOrders ?? [];
  const lowStockProducts = dashboardData?.lowStockProducts ?? [];

  const seriesFromApi = normalizeSeries(dashboardData?.revenueSeries);
  const revenueSeries = useMemo(() => {
    if (Array.isArray(revenueData?.labels) && Array.isArray(revenueData?.values) && revenueData.labels.length > 0) {
      return revenueData.labels.map((label, index) => ({
        label,
        revenue: Number(revenueData.values[index] || 0),
      }));
    }

    if (seriesFromApi.length > 0) {
      return seriesFromApi;
    }

    return buildRevenueSeries(orders, Number(totalRevenue) || 0);
  }, [orders, revenueData?.labels, revenueData?.values, seriesFromApi, totalRevenue]);

  const hasRevenueData = revenueSeries.some((item) => item.revenue > 0);
  const selectedRevenueTotal = Number(revenueData?.total ?? 0);
  const activeRevenueMode = revenueData?.mode || revenueFilters.mode;
  const useHybridRevenueChart = activeRevenueMode === 'day' || activeRevenueMode === 'week';

  const onApplyRevenueFilters = useCallback(() => {
    const validationMessage = validateRevenueFilters();
    if (validationMessage) {
      setRevenueError(validationMessage);
      return;
    }
    fetchRevenue(revenueFilters);
  }, [fetchRevenue, revenueFilters, validateRevenueFilters]);

  const onResetRevenueFilters = useCallback(() => {
    const defaults = getDefaultRevenueFilters();
    setRevenueFilters(defaults);
    setRevenueError('');
    fetchRevenue(defaults);
  }, [fetchRevenue]);

  const onWeekInputChange = useCallback((weekValue) => {
    const range = parseWeekInputToRange(weekValue);
    if (!range) {
      setRevenueFilters((prev) => ({ ...prev, week: weekValue }));
      return;
    }

    setRevenueFilters((prev) => ({
      ...prev,
      week: weekValue,
      weekFrom: range.from,
      weekTo: range.to,
    }));
  }, []);

  const applyRevenuePreset = useCallback((preset) => {
    if (preset === '7d') {
      const range = getDayRangePreset(7);
      const next = {
        ...revenueFilters,
        mode: 'day',
        from: range.from,
        to: range.to,
      };
      setRevenueFilters(next);
      setRevenueError('');
      fetchRevenue(next);
      return;
    }

    if (preset === '30d') {
      const range = getDayRangePreset(30);
      const next = {
        ...revenueFilters,
        mode: 'day',
        from: range.from,
        to: range.to,
      };
      setRevenueFilters(next);
      setRevenueError('');
      fetchRevenue(next);
      return;
    }

    if (preset === 'month') {
      const monthValue = getCurrentMonthValue();
      const monthRange = getCurrentMonthRange();
      const next = {
        ...revenueFilters,
        mode: 'month',
        month: monthValue,
        from: monthRange.from,
        to: monthRange.to,
      };
      setRevenueFilters(next);
      setRevenueError('');
      fetchRevenue(next);
      return;
    }

    if (preset === 'year') {
      const yearValue = getCurrentYearValue();
      const next = {
        ...revenueFilters,
        mode: 'year',
        year: yearValue,
      };
      setRevenueFilters(next);
      setRevenueError('');
      fetchRevenue(next);
    }
  }, [fetchRevenue, revenueFilters]);

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
            <p className="overview-card-subtitle">{getRevenueSubtitle(activeRevenueMode)}</p>
          </div>

          <div className="overview-chart-shell">
            <div className="overview-revenue-controls" aria-label="Bộ lọc thống kê doanh thu">
              <div className="overview-revenue-grid">
                <div className="overview-field">
                  <label htmlFor="revenue-mode">Kiểu thống kê</label>
                  <select
                    id="revenue-mode"
                    className="luxury-input-field"
                    value={revenueFilters.mode}
                    onChange={(event) => setRevenueFilters((prev) => ({ ...prev, mode: event.target.value }))}
                  >
                    {REVENUE_MODES.map((modeOption) => (
                      <option key={modeOption.value} value={modeOption.value}>
                        {modeOption.label}
                      </option>
                    ))}
                  </select>
                </div>

                {revenueFilters.mode === 'month' ? (
                  <div className="overview-field">
                    <label htmlFor="revenue-month">Tháng</label>
                    <input
                      id="revenue-month"
                      className="luxury-input-field"
                      type="month"
                      value={revenueFilters.month}
                      onChange={(event) => setRevenueFilters((prev) => ({ ...prev, month: event.target.value }))}
                    />
                  </div>
                ) : null}

                {revenueFilters.mode === 'year' ? (
                  <div className="overview-field">
                    <label htmlFor="revenue-year">Năm</label>
                    <input
                      id="revenue-year"
                      className="luxury-input-field"
                      type="number"
                      min="2000"
                      max="2100"
                      value={revenueFilters.year}
                      onChange={(event) => setRevenueFilters((prev) => ({ ...prev, year: event.target.value }))}
                    />
                  </div>
                ) : null}

                {revenueFilters.mode === 'week' ? (
                  <>
                    <div className="overview-field">
                      <label htmlFor="revenue-week">Tuần (ISO)</label>
                      <input
                        id="revenue-week"
                        className="luxury-input-field"
                        type="week"
                        value={revenueFilters.week}
                        onChange={(event) => onWeekInputChange(event.target.value)}
                      />
                    </div>
                    <div className="overview-field">
                      <label htmlFor="revenue-week-from">Từ ngày (Mon)</label>
                      <input
                        id="revenue-week-from"
                        className="luxury-input-field"
                        type="date"
                        value={revenueFilters.weekFrom}
                        onChange={(event) => setRevenueFilters((prev) => ({ ...prev, weekFrom: event.target.value }))}
                      />
                    </div>
                    <div className="overview-field">
                      <label htmlFor="revenue-week-to">Đến ngày (Sun)</label>
                      <input
                        id="revenue-week-to"
                        className="luxury-input-field"
                        type="date"
                        value={revenueFilters.weekTo}
                        onChange={(event) => setRevenueFilters((prev) => ({ ...prev, weekTo: event.target.value }))}
                      />
                    </div>
                  </>
                ) : null}

                {revenueFilters.mode === 'day' || revenueFilters.mode === 'weekday' ? (
                  <>
                    <div className="overview-field">
                      <label htmlFor="revenue-from">Từ ngày</label>
                      <input
                        id="revenue-from"
                        className="luxury-input-field"
                        type="date"
                        value={revenueFilters.from}
                        onChange={(event) => setRevenueFilters((prev) => ({ ...prev, from: event.target.value }))}
                      />
                    </div>
                    <div className="overview-field">
                      <label htmlFor="revenue-to">Đến ngày</label>
                      <input
                        id="revenue-to"
                        className="luxury-input-field"
                        type="date"
                        value={revenueFilters.to}
                        onChange={(event) => setRevenueFilters((prev) => ({ ...prev, to: event.target.value }))}
                      />
                    </div>
                  </>
                ) : null}
              </div>

              <div className="overview-revenue-actions">
                <button
                  type="button"
                  className="luxury-button-gold"
                  disabled={isRevenueLoading}
                  onClick={onApplyRevenueFilters}
                >
                  {isRevenueLoading ? 'ĐANG TẢI...' : 'APPLY'}
                </button>
                <button
                  type="button"
                  className="luxury-input-field overview-reset-btn"
                  disabled={isRevenueLoading}
                  onClick={onResetRevenueFilters}
                >
                  RESET
                </button>
              </div>

              <div className="overview-revenue-presets" aria-label="Preset thời gian nhanh">
                <button type="button" className="overview-preset-btn" onClick={() => applyRevenuePreset('7d')} disabled={isRevenueLoading}>
                  7 ngày
                </button>
                <button type="button" className="overview-preset-btn" onClick={() => applyRevenuePreset('30d')} disabled={isRevenueLoading}>
                  30 ngày
                </button>
                <button type="button" className="overview-preset-btn" onClick={() => applyRevenuePreset('month')} disabled={isRevenueLoading}>
                  Tháng này
                </button>
                <button type="button" className="overview-preset-btn" onClick={() => applyRevenuePreset('year')} disabled={isRevenueLoading}>
                  Năm nay
                </button>
              </div>

              {revenueError ? <p className="overview-revenue-error">{revenueError}</p> : null}
            </div>

            <div className="overview-chart-canvas">
            {hasRevenueData ? (
              <ResponsiveContainer width="100%" height="100%">
                {useHybridRevenueChart ? (
                  <ComposedChart data={revenueSeries} margin={{ top: 6, right: 16, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="label"
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
                    <Bar dataKey="revenue" fill="#d4af37" radius={[8, 8, 0, 0]} maxBarSize={36} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f3d57c"
                      strokeWidth={2}
                      dot={{ r: 3, stroke: '#f3d57c', fill: '#0f0f0f' }}
                      activeDot={{ r: 5 }}
                    />
                  </ComposedChart>
                ) : (
                  <BarChart data={revenueSeries} margin={{ top: 6, right: 16, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="label"
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
                )}
              </ResponsiveContainer>
            ) : (
              <div className="overview-empty-state" role="status">
                <p>Chưa có dữ liệu doanh thu theo tháng để hiển thị biểu đồ.</p>
              </div>
            )}
            </div>
          </div>
          <p className="overview-chart-note">
            Tổng doanh thu theo bộ lọc: {vnd(selectedRevenueTotal)}
            {revenueData?.from && revenueData?.to ? ` | Khoảng: ${revenueData.from} → ${revenueData.to}` : ''}
            {revenueData?.timezone ? ` | Timezone: ${revenueData.timezone}` : ''}
          </p>
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

