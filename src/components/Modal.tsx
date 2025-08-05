import React, { useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useFocusTrap } from '../hooks/useAccessibility'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = ''
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const focusTrapRef = useFocusTrap(isOpen)

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-none m-4'
  }

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeOnEscape, onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={focusTrapRef}
        className={`
          relative bg-white rounded-lg shadow-xl w-full mx-4
          ${sizeClasses[size]}
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'danger'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const typeStyles = {
    info: {
      icon: '💡',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    warning: {
      icon: '⚠️',
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    danger: {
      icon: '🚨',
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
    }
  }

  const currentType = typeStyles[type]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div className="text-4xl mb-4">{currentType.icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-md transition-colors ${currentType.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  position?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg'
  title?: string
  children: React.ReactNode
  overlay?: boolean
}

export function Drawer({
  isOpen,
  onClose,
  position = 'right',
  size = 'md',
  title,
  children,
  overlay = true
}: DrawerProps) {
  const focusTrapRef = useFocusTrap(isOpen)

  const positionClasses = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full'
  }

  const sizeClasses = {
    sm: position === 'left' || position === 'right' ? 'w-80' : 'h-80',
    md: position === 'left' || position === 'right' ? 'w-96' : 'h-96',
    lg: position === 'left' || position === 'right' ? 'w-1/2' : 'h-1/2'
  }

  const translateClasses = {
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
    top: isOpen ? 'translate-y-0' : '-translate-y-full',
    bottom: isOpen ? 'translate-y-0' : 'translate-y-full'
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      {overlay && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={focusTrapRef}
        className={`
          fixed z-50 bg-white shadow-xl transition-transform duration-300 ease-in-out
          ${positionClasses[position]}
          ${sizeClasses[size]}
          ${translateClasses[position]}
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Close drawer"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 h-full overflow-auto">
          {children}
        </div>
      </div>
    </>
  )
}
