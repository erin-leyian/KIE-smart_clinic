import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Reusable Modal Component for all pages
 * Supports: confirmation, alert, info, booking, custom content
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  type = 'default', // 'success', 'error', 'warning', 'info', 'booking', 'default'
  actions = [], // [{ label: string, onClick: func, variant: 'primary' | 'secondary' | 'danger' }]
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  closeOnBackdropClick = true,
  closeButton = true,
  animated = true
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen && !isAnimating) return null;

  // Determine size classes
  const sizeClasses = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-2xl'
  };

  // Determine type styling
  const typeStyles = {
    success: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    error: { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    warning: { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    info: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    booking: { icon: null, color: 'text-teal-600', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
    default: { icon: null, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' }
  };

  const style = typeStyles[type];
  const IconComponent = style.icon;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-200 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`${sizeClasses[size]} bg-white rounded-xl shadow-xl transition-all duration-200 transform ${
            isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Header */}
          {(title || closeButton) && (
            <div className={`px-6 py-4 border-b ${style.borderColor} flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                {IconComponent && (
                  <IconComponent className={`w-6 h-6 ${style.color}`} />
                )}
                <div>
                  {title && (
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                  )}
                  {subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                  )}
                </div>
              </div>
              {closeButton && (
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>

          {/* Footer with Actions */}
          {actions.length > 0 && (
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex justify-end space-x-3">
              {actions.map((action, index) => {
                const variantClasses = {
                  primary: 'bg-teal-500 text-white hover:bg-teal-600',
                  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
                  danger: 'bg-red-500 text-white hover:bg-red-600'
                };

                return (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick();
                      if (action.closeOnClick !== false) {
                        handleClose();
                      }
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition ${variantClasses[action.variant] || variantClasses.primary}`}
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
