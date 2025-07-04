import { Dialog } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import React from 'react';

interface Message {
  id: string;
  content: string;
  timestamp: string;
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  isLoading: boolean;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  messages,
  isLoading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Preview Messages</h2>
        {isLoading ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <div key={message.id} className="p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-800">{message.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(message.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default PreviewModal;
