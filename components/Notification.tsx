
import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export interface NotificationState {
  isOpen: boolean;
  type: 'error' | 'success';
  title: string;
  message: string;
}

interface NotificationProps {
  notification: NotificationState;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification.isOpen) {
      setIsVisible(true);
      // Auto-close after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to finish before unmounting logically
    setTimeout(onClose, 300);
  };

  if (!notification.isOpen && !isVisible) return null;

  const isError = notification.type === 'error';

  return (
    <div 
      className={`
        fixed bottom-20 left-0 right-0 z-[60] flex justify-center pointer-events-none px-4
        transition-all duration-300 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
      `}
    >
      <div 
        className={`
          pointer-events-auto
          flex items-start gap-4 max-w-sm w-full shadow-2xl rounded-2xl p-4 border
          ${isError 
            ? 'bg-white dark:bg-darkbg-900 border-red-100 dark:border-red-900/30' 
            : 'bg-white dark:bg-darkbg-900 border-chef-100 dark:border-chef-900/30'}
        `}
      >
        <div 
          className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            ${isError ? 'bg-red-100 text-red-500' : 'bg-chef-100 text-chef-600'}
          `}
        >
          {isError ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
        </div>

        <div className="flex-1 pt-1">
          <h4 
            className={`
              font-bold text-sm mb-1
              ${isError ? 'text-red-600 dark:text-red-400' : 'text-chef-900 dark:text-white'}
            `}
          >
            {notification.title}
          </h4>
          <p className="text-xs font-medium text-chef-500 dark:text-gray-400 leading-relaxed">
            {notification.message}
          </p>
        </div>

        <button 
          onClick={handleClose}
          className="text-chef-400 hover:text-chef-800 dark:text-gray-500 dark:hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Notification;
