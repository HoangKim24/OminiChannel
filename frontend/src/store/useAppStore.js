import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export const useAppStore = create(
  persist(
    (set, get) => ({
      // User Auth
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),

      // Cart
      cart: [],
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
      removeFromCart: (id) => set((state) => ({ cart: state.cart.filter(i => i.id !== id) })),
      clearCart: () => set({ cart: [] }),

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
          set({ products: Array.isArray(products) ? products : [] })

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

      fetchOrders: async () => {
        const { user } = get()
        if (!user) { set({ orders: [] }); return }
        try {
          set({ loadingOrders: true })
          const endpoint = user.role === 'Admin' ? '/api/orders' : `/api/orders/user/${user.id}`
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
          set({ orders: Array.isArray(data) ? data : [] })
        } catch (err) { 
          console.error('Fetch orders error:', err)
          get().showToast?.('Lỗi tải danh sách đơn hàng', 'error')
        }
        finally { set({ loadingOrders: false }) }
      }
    }),
    {
      name: 'kp-storage', // unique localstorage key
      partialize: (state) => ({ user: state.user, cart: state.cart, favorites: state.favorites }),
    }
  )
)
