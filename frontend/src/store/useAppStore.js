import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const normalizeProduct = (product) => ({
  id: product.id ?? product.Id,
  name: product.name ?? product.Name ?? '',
  brand: product.brand ?? product.Brand ?? 'KP',
  price: Number(product.price ?? product.Price ?? 0),
  description: product.description ?? product.Description ?? '',
  imageUrl: product.imageUrl ?? product.ImageUrl ?? '',
  categoryId: product.categoryId ?? product.CategoryId ?? null,
  gender: product.gender ?? product.Gender ?? 'Unisex',
  stockQuantity: Number(product.stockQuantity ?? product.StockQuantity ?? 0),
  topNotes: product.topNotes ?? product.TopNotes ?? '',
  middleNotes: product.middleNotes ?? product.MiddleNotes ?? '',
  baseNotes: product.baseNotes ?? product.BaseNotes ?? '',
  origin: product.origin ?? product.Origin ?? '',
  concentration: product.concentration ?? product.Concentration ?? '',
  brandStory: product.brandStory ?? product.BrandStory ?? '',
  volumeOptions: product.volumeOptions ?? product.VolumeOptions ?? '',
})

const normalizeOrderItem = (item) => ({
  id: item.id ?? item.Id,
  orderId: item.orderId ?? item.OrderId,
  perfumeId: item.perfumeId ?? item.PerfumeId,
  perfumeName: item.perfumeName ?? item.PerfumeName ?? 'Sản phẩm',
  quantity: Number(item.quantity ?? item.Quantity ?? 0),
  price: Number(item.price ?? item.Price ?? 0),
})

const normalizeOrder = (order) => ({
  id: order.id ?? order.Id,
  userId: order.userId ?? order.UserId,
  orderDate: order.orderDate ?? order.OrderDate,
  totalAmount: Number(order.totalAmount ?? order.TotalAmount ?? 0),
  status: order.status ?? order.Status ?? 'Pending',
  shippingAddress: order.shippingAddress ?? order.ShippingAddress ?? '',
  receiverPhone: order.receiverPhone ?? order.ReceiverPhone ?? '',
  note: order.note ?? order.Note ?? '',
  isPickup: order.isPickup ?? order.IsPickup ?? false,
  voucherCode: order.voucherCode ?? order.VoucherCode ?? '',
  discountAmount: Number(order.discountAmount ?? order.DiscountAmount ?? 0),
  items: Array.isArray(order.items ?? order.Items) ? (order.items ?? order.Items).map(normalizeOrderItem) : [],
})

const normalizeChannelProduct = (channelProduct) => ({
  id: channelProduct.id ?? channelProduct.Id,
  salesChannelId: channelProduct.salesChannelId ?? channelProduct.SalesChannelId,
  perfumeId: channelProduct.perfumeId ?? channelProduct.PerfumeId,
  channelPrice: Number(channelProduct.channelPrice ?? channelProduct.ChannelPrice ?? 0),
  isListed: channelProduct.isListed ?? channelProduct.IsListed ?? false,
  lastSyncedAt: channelProduct.lastSyncedAt ?? channelProduct.LastSyncedAt,
  salesChannel: channelProduct.salesChannel ?? channelProduct.SalesChannel ?? null,
  perfume: channelProduct.perfume ? normalizeProduct(channelProduct.perfume) : channelProduct.Perfume ? normalizeProduct(channelProduct.Perfume) : null,
})

const isAdminRole = (role) => String(role || '').trim().toLowerCase() === 'admin'

export const useAppStore = create(
  persist(
    (set, get) => ({
      // User Auth
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),

      // Cart
      cart: [],
      cartNote: '',
      setCartNote: (cartNote) => set({ cartNote }),
      addToCart: (product, qty = 1, engraving = null) => {
        set((state) => {
          const existing = state.cart.find(i => i.id === product.id)
          const newItem = {
            id: product.id, name: product.name, price: product.price,
            imageUrl: product.imageUrl, quantity: qty,
            engraving: engraving
          }
          if (existing) {
            return {
              cart: state.cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + qty, engraving: engraving || i.engraving } : i)
            }
          }
          return { cart: [...state.cart, newItem] }
        })
      },
      updateCartQty: (id, change) => {
        set((state) => ({
          cart: state.cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + change) } : i)
        }))
      },
      setCartItemQty: (id, quantity) => {
        const normalizedQty = Math.max(1, Number.parseInt(quantity, 10) || 1)
        set((state) => ({
          cart: state.cart.map(i => i.id === id ? { ...i, quantity: normalizedQty } : i)
        }))
      },
      removeFromCart: (id) => set((state) => ({ cart: state.cart.filter(i => i.id !== id) })),
      clearCart: () => set({ cart: [], cartNote: '' }),

      // Favorites
      favorites: [],
      toggleFavorite: (productId) => {
        set((state) => {
          if (state.favorites.includes(productId)) {
            get().showToast('Đã bỏ yêu thích')
            return { favorites: state.favorites.filter(id => id !== productId) }
          }
          get().showToast('Đã thêm vào yêu thích ❤️')
          return { favorites: [...state.favorites, productId] }
        })
      },

      // UI State (Toasts, Modals)
      toasts: [],
      showToast: (message, type = 'success') => {
        const id = Date.now() + Math.random();
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.map(t => t.id === id ? { ...t, removing: true } : t)
          }))
          setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }))
          }, 300)
        }, 2500)
      },
      authModal: null, // null | 'login' | 'register'
      setAuthModal: (modal) => set({ authModal: modal }),
      quizOpen: false,
      setQuizOpen: (isOpen) => set({ quizOpen: isOpen }),

      // Global Data
      products: [],
      channels: [],
      channelProducts: [],
      loading: false,
      orders: [],
      loadingOrders: false,

      // Search & Filters
      searchTerm: '',
      setSearchTerm: (term) => set({ searchTerm: term }),
      sortBy: 'default',
      setSortBy: (sort) => set({ sortBy: sort }),
      filterGender: 'All',
      setFilterGender: (gender) => set({ filterGender: gender }),
      filterFamily: 'All',
      setFilterFamily: (family) => set({ filterFamily: family }),
      filterConcentration: 'All',
      setFilterConcentration: (conc) => set({ filterConcentration: conc }),
      priceRange: 50000000,
      setPriceRange: (price) => set({ priceRange: price }),
      
      fetchProducts: async () => {
        try {
          set({ loading: true })
          const res = await fetch(`${API_BASE}/api/perfumes`)
          if (!res.ok) {
            throw new Error('Failed to fetch products')
          }
          const products = await res.json()
          set({ products: Array.isArray(products) ? products.map(normalizeProduct) : [] })

          const resChannels = await fetch(`${API_BASE}/api/channels`)
          if (resChannels.ok) {
            const data = await resChannels.json()
            set({ channels: Array.isArray(data) ? data.filter(c => c.isActive) : [] })
          }
        } catch (err) {
          console.error('Fetch products error:', err)
          // Show error in toast if available
          const { showToast } = get()
          showToast?.('Lỗi tải danh sách sản phẩm', 'error')
        } finally {
          set({ loading: false })
        }
      },

      fetchChannelProducts: async () => {
        try {
          const res = await fetch(`${API_BASE}/api/channels/products`)
          if (!res.ok) {
            throw new Error('Failed to fetch channel products')
          }
          const data = await res.json()
          set({ channelProducts: Array.isArray(data) ? data.map(normalizeChannelProduct) : [] })
        } catch (err) {
          console.error('Fetch channel products error:', err)
        }
      },

      fetchOrders: async () => {
        const { user } = get()
        if (!user) { set({ orders: [] }); return }
        try {
          set({ loadingOrders: true })
          const endpoint = isAdminRole(user.role) ? '/api/orders' : `/api/orders/user/${user.id}`
          const headers = {}
          if (user?.role) headers['X-User-Role'] = user.role
          if (user?.accessToken) headers.Authorization = `Bearer ${user.accessToken}`
          
          const res = await fetch(`${API_BASE}${endpoint}`, { headers })
          if (!res.ok) {
            if (res.status === 401) {
              // Token expired - logout
              get().logout()
              get().showToast?.('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error')
              return
            }
            throw new Error('Failed to fetch orders')
          }
          const data = await res.json()
          set({ orders: Array.isArray(data) ? data.map(normalizeOrder) : [] })
        } catch (err) { 
          console.error('Fetch orders error:', err)
          get().showToast?.('Lỗi tải danh sách đơn hàng', 'error')
        }
        finally { set({ loadingOrders: false }) }
      }
    }),
    {
      name: 'kp-storage', // unique localstorage key
      partialize: (state) => ({ user: state.user, cart: state.cart, cartNote: state.cartNote, favorites: state.favorites }),
    }
  )
)
