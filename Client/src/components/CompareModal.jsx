import { HiXMark, HiDocument, HiSparkles } from 'react-icons/hi2';
import ReactMarkdown from 'react-markdown';

const CompareModal = ({ isOpen, onClose, originalArticle, enhancedArticle }) => {
  if (!isOpen || !originalArticle || !enhancedArticle) return null;

  const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] overflow-hidden">
      <div className="w-full h-full flex flex-col">
        {/* Header */}
        <div className="bg-[#001433] border-b-2 border-[#35DE57] p-4 md:p-6 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <HiDocument className="text-[#87CEEB]" />
            <span className="hidden sm:inline">Compare:</span>
            <span className="truncate max-w-[200px] md:max-w-none">{originalArticle.title}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#002147] rounded-full flex-shrink-0"
          >
            <HiXMark className="text-2xl md:text-3xl" />
          </button>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Original Article */}
            <div className="flex flex-col bg-[#001433] border-r-0 lg:border-r-2 border-[#35DE57]/30 overflow-hidden">
              <div className="bg-[#002147] p-3 md:p-4 border-b-2 border-[#87CEEB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiDocument className="text-[#87CEEB] text-lg md:text-xl" />
                  <h3 className="text-base md:text-lg font-bold text-[#87CEEB]">Original Article</h3>
                </div>
                <span className="text-xs md:text-sm text-gray-400">
                  {getWordCount(originalArticle.content)} words
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <h4 className="text-xl md:text-2xl font-bold text-white mb-4">{originalArticle.title}</h4>
                <div className="text-gray-300 text-sm md:text-base space-y-4 leading-relaxed">
                  {originalArticle.content.split('\n\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="mb-3 text-gray-300">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Article */}
            <div className="flex flex-col bg-[#001433] border-t-2 lg:border-t-0 border-[#35DE57]/30 overflow-hidden">
              <div className="bg-[#002147] p-3 md:p-4 border-b-2 border-[#35DE57] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiSparkles className="text-[#35DE57] text-lg md:text-xl" />
                  <h3 className="text-base md:text-lg font-bold text-[#35DE57]">Enhanced Article</h3>
                </div>
                <span className="text-xs md:text-sm text-gray-400">
                  {getWordCount(enhancedArticle.content)} words
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <h4 className="text-xl md:text-2xl font-bold text-white mb-4">{enhancedArticle.title}</h4>
                <div className="prose prose-invert prose-sm md:prose-base max-w-none">
                  <ReactMarkdown 
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6 mt-6 md:mt-8" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl md:text-3xl font-bold text-white mb-3 md:mb-4 mt-4 md:mt-6" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg md:text-2xl font-bold text-white mb-2 md:mb-3 mt-3 md:mt-5" {...props} />,
                      p: ({node, ...props}) => <p className="text-gray-300 mb-3 md:mb-4 leading-relaxed text-sm md:text-base" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 md:mb-4 text-gray-300 text-sm md:text-base" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 md:mb-4 text-gray-300 text-sm md:text-base" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1 md:mb-2" {...props} />,
                      strong: ({node, ...props}) => <strong className="text-[#35DE57] font-bold" {...props} />,
                      em: ({node, ...props}) => <em className="text-[#87CEEB] italic" {...props} />,
                      code: ({node, ...props}) => <code className="bg-[#002147] px-1 md:px-2 py-1 rounded text-[#35DE57] text-xs md:text-sm" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#35DE57] pl-3 md:pl-4 italic text-gray-400 mb-3 md:mb-4" {...props} />,
                      a: ({node, ...props}) => <a className="text-[#35DE57] hover:text-[#2bc948] underline" target="_blank" rel="noopener noreferrer" {...props} />,
                      hr: ({node, ...props}) => <hr className="border-t-2 border-[#35DE57]/30 my-6 md:my-8" {...props} />,
                    }}
                  >
                    {enhancedArticle.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#001433] border-t border-[#35DE57]/30 p-3 md:p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 md:px-6 py-2 md:py-3 bg-[#35DE57] text-[#001433] font-bold rounded-lg hover:bg-[#2bc948] transition-colors text-sm md:text-base"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
