import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Lock scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="card" 
        style={{ width: '100%', maxWidth: '500px', margin: 0, position: 'relative', outline: 'none' }}
        tabIndex="-1"
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer' }}
          aria-label="Close Modal"
        >
          <X size={20} />
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', paddingRight: '32px' }}>{title}</h2>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
