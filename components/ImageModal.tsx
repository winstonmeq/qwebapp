import { X } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export default function ImageModal({ imageUrl, onClose }: ImageModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white hover:text-gray-300"
      >
        <X size={32} />
      </button>
      <img 
        src={imageUrl} 
        alt="Emergency evidence" 
        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" 
      />
    </div>
  );
}