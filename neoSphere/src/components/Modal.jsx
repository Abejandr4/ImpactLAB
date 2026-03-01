export default function Modal({ isOpen, onClose, url }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-black"
        >
          ✕
        </button>
        
        {/* External Content */}
        <iframe src={url} className="w-full h-full border-none" title="Popup Content" />
      </div>
    </div>
  );
}