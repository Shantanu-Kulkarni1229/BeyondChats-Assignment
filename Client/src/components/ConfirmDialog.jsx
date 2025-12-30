import { HiExclamationTriangle, HiQuestionMarkCircle } from 'react-icons/hi2';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type = 'confirm' }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const isWarning = type === 'warning';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#001433] border-2 border-[#35DE57] rounded-lg w-full max-w-md shadow-2xl shadow-[#35DE57]/20 animate-slideIn">
        {/* Header */}
        <div className={`p-6 border-b-2 ${isWarning ? 'border-red-500/30' : 'border-[#35DE57]/30'}`}>
          <div className="flex items-center gap-3">
            {isWarning ? (
              <HiExclamationTriangle className="text-red-500 text-4xl flex-shrink-0" />
            ) : (
              <HiQuestionMarkCircle className="text-[#87CEEB] text-4xl flex-shrink-0" />
            )}
            <h3 className={`text-xl sm:text-2xl font-bold ${isWarning ? 'text-red-500' : 'text-white'}`}>
              {title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-[#35DE57]/30 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={handleCancel}
            className="px-6 py-3 border-2 border-gray-500 text-gray-300 font-bold rounded-lg hover:bg-gray-500/10 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-3 font-bold rounded-lg transition-colors text-sm sm:text-base ${
              isWarning
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-[#35DE57] text-[#001433] hover:bg-[#2bc948]'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
