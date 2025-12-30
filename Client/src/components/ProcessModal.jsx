import { useEffect, useRef } from 'react';
import { HiCheckCircle, HiXCircle, HiClock, HiXMark } from 'react-icons/hi2';

const ProcessModal = ({ isOpen, onClose, title, logs, isComplete, hasError }) => {
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#001433] border-2 border-[#35DE57] rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#35DE57]/30">
          <div className="flex items-center gap-3">
            {hasError ? (
              <HiXCircle className="w-6 h-6 text-red-500" />
            ) : isComplete ? (
              <HiCheckCircle className="w-6 h-6 text-[#35DE57]" />
            ) : (
              <HiClock className="w-6 h-6 text-yellow-500 animate-pulse" />
            )}
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
          {isComplete && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#002147] rounded-full"
            >
              <HiXMark className="text-2xl" />
            </button>
          )}
        </div>

        {/* Console Logs */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 font-mono text-sm bg-[#000a1a]">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#35DE57] mb-4"></div>
              <p>Initializing process...</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`p-3 rounded ${
                  log.type === 'error'
                    ? 'bg-red-900/20 text-red-400 border-l-4 border-red-500'
                    : log.type === 'success'
                    ? 'bg-green-900/20 text-green-400 border-l-4 border-green-500'
                    : log.type === 'warning'
                    ? 'bg-yellow-900/20 text-yellow-400 border-l-4 border-yellow-500'
                    : 'bg-[#002147] text-gray-300 border-l-4 border-[#35DE57]'
                }`}
              >
                <span className="text-gray-500 mr-3">[{log.timestamp}]</span>
                <span>{log.message}</span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#35DE57]/30 flex items-center justify-between">
          <div className="text-sm text-gray-400 flex items-center gap-2">
            {hasError ? (
              <>
                <HiXCircle className="text-red-400" />
                <span className="text-red-400">Process failed with errors</span>
              </>
            ) : isComplete ? (
              <>
                <HiCheckCircle className="text-[#35DE57]" />
                <span className="text-[#35DE57]">Process completed successfully</span>
              </>
            ) : (
              <>
                <HiClock className="text-yellow-500" />
                <span>Processing... Please wait</span>
              </>
            )}
          </div>
          {isComplete && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#35DE57] text-[#001433] font-bold rounded-lg hover:bg-[#2bc948] transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessModal;
