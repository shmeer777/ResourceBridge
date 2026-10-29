import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import BookingConversationThread from './BookingConversationThread';

interface BookingConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  resourceTitle?: string;
  bookingStatus?: string;
  participantName?: string;
  participantRole?: 'provider' | 'seeker' | string;
  participantOrg?: string;
}

export const BookingConversationModal: React.FC<BookingConversationModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  resourceTitle,
  bookingStatus,
  participantName,
  participantRole,
  participantOrg
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl h-[90vh] max-h-[640px] flex flex-col rounded-3xl bg-[#101218] border border-white/10 shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <BookingConversationThread
          bookingId={bookingId}
          resourceTitle={resourceTitle}
          bookingStatus={bookingStatus}
          participantName={participantName}
          participantRole={participantRole}
          participantOrg={participantOrg}
        />
      </div>
    </div>
  );
};

export default BookingConversationModal;
