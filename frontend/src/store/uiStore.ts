/**
 * UI Store
 * 
 * Zustand store for managing UI state including modals, sidebar, toasts, and loading indicators.
 * 
 * @module UIStore
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Types
export interface ModalState {
  isOpen: boolean
  title: string
  description: string
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info' | 'question'
}

interface ToastState {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  
  // Modals
  confirmationModal: ModalState
  paymentModal: {
    isOpen: boolean
    eventId: string | null
    ticketTypeId: string | null
    attendeeName: string
    quantity: number
  }
  
  // Loading
  globalLoading: boolean
  loadingOverlay: boolean
  
  // Toast (managed by sonner, but kept for consistency)
  toast: ToastState | null
  
  // Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  
  openConfirmationModal: (modal: Omit<ModalState, 'isOpen'>) => void
  closeConfirmationModal: () => void
  
  openPaymentModal: (data: {
    eventId: string
    ticketTypeId: string
    attendeeName: string
    quantity: number
  }) => void
  closePaymentModal: () => void
  
  setGlobalLoading: (loading: boolean) => void
  setLoadingOverlay: (show: boolean) => void
  
  showToast: (toast: ToastState) => void
  hideToast: () => void
}

// Initial state
const initialModalState: ModalState = {
  isOpen: false,
  title: '',
  description: '',
  variant: 'danger',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
}

const initialState = {
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  confirmationModal: initialModalState,
  paymentModal: {
    isOpen: false,
    eventId: null,
    ticketTypeId: null,
    attendeeName: '',
    quantity: 1,
  },
  globalLoading: false,
  loadingOverlay: false,
  toast: null,
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      ...initialState,

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed })
      },

      setMobileMenuOpen: (open: boolean) => {
        set({ mobileMenuOpen: open })
      },

      openConfirmationModal: (modal: Omit<ModalState, 'isOpen'>) => {
        set({
          confirmationModal: {
            ...modal,
            isOpen: true,
          },
        })
      },

      closeConfirmationModal: () => {
        set({
          confirmationModal: {
            ...initialModalState,
          },
        })
      },

      openPaymentModal: (data: {
        eventId: string
        ticketTypeId: string
        attendeeName: string
        quantity: number
      }) => {
        set({
          paymentModal: {
            isOpen: true,
            ...data,
          },
        })
      },

      closePaymentModal: () => {
        set({
          paymentModal: {
            isOpen: false,
            eventId: null,
            ticketTypeId: null,
            attendeeName: '',
            quantity: 1,
          },
        })
      },

      setGlobalLoading: (loading: boolean) => {
        set({ globalLoading: loading })
      },

      setLoadingOverlay: (show: boolean) => {
        set({ loadingOverlay: show })
      },

      showToast: (toast: ToastState) => {
        set({ toast })
        // Auto-hide after duration
        setTimeout(() => {
          set({ toast: null })
        }, toast.duration || 4000)
      },

      hideToast: () => {
        set({ toast: null })
      },
    }),
    { name: 'UIStore' }
  )
)

// Helper hook for confirmation modal
export const useConfirmationModal = () => {
  const { confirmationModal, openConfirmationModal, closeConfirmationModal } = useUIStore()
  
  const confirm = (options: Omit<ModalState, 'isOpen'>) => {
    openConfirmationModal(options)
  }
  
  return {
    confirm,
    modal: confirmationModal,
    close: closeConfirmationModal,
  }
}

// Helper hook for payment modal
export const usePaymentModal = () => {
  const { paymentModal, openPaymentModal, closePaymentModal } = useUIStore()
  
  const open = (data: {
    eventId: string
    ticketTypeId: string
    attendeeName: string
    quantity: number
  }) => {
    openPaymentModal(data)
  }
  
  return {
    open,
    modal: paymentModal,
    close: closePaymentModal,
  }
}