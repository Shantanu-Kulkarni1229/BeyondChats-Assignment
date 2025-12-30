import { HiXMark, HiCalendar, HiClock, HiDocument } from 'react-icons/hi2';
import ReactMarkdown from 'react-markdown';

const ArticleReader = ({ isOpen, onClose, article, isEnhanced = false }) => {
  if (!isOpen || !article) return null;

  const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getReadingTime = (wordCount) => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const wordCount = getWordCount(article.content);

  return (
    <div className="fixed inset-0 bg-[#001433] z-[100] overflow-hidden">
      <div className="w-full h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#001433] border-b-2 border-[#35DE57] p-6 flex items-center justify-between z-50 shadow-lg">
          <div className="flex items-center gap-3">
            {isEnhanced && (
              <span className="px-3 py-1 bg-[#35DE57] text-[#001433] text-xs font-bold rounded-full flex items-center gap-1">
                <HiDocument className="text-sm" />
                ENHANCED
              </span>
            )}
            <h2 className="text-2xl font-bold text-white">Article Reader</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#002147] rounded-full"
          >
            <HiXMark className="text-3xl" />
          </button>
        </div>

        {/* Article Images */}
        {article.images && article.images.length > 0 ? (
          <div className="space-y-4">
            {article.images.map((img, index) => (
              <div key={index} className="w-full max-h-[600px] overflow-hidden bg-gray-900">
                <img 
                  src={img} 
                  alt={`${article.title} - Image ${index + 1}`}
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    e.target.parentElement.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        ) : article.image ? (
          <div className="w-full max-h-[600px] overflow-hidden bg-gray-900">
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full h-auto object-contain"
              onError={(e) => {
                e.target.parentElement.style.display = 'none';
              }}
            />
          </div>
        ) : null}

        {/* Article Content */}
        <div className="p-8">
          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-8 pb-6 border-b border-[#35DE57]/20">
            <div className="flex items-center gap-2">
              <HiCalendar className="text-[#87CEEB]" />
              <span>{new Date(article.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <HiClock className="text-[#35DE57]" />
              <span>{getReadingTime(wordCount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <HiDocument className="text-[#87CEEB]" />
              <span>{wordCount.toLocaleString()} words</span>
            </div>
          </div>

          {/* Article Body */}
          <div className="w-full">
            {isEnhanced ? (
              <div className="prose prose-invert prose-lg max-w-none w-full">
                <ReactMarkdown 
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-4xl font-bold text-white mb-6 mt-8" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-3xl font-bold text-white mb-4 mt-6" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-2xl font-bold text-white mb-3 mt-5" {...props} />,
                    p: ({node, ...props}) => <p className="text-gray-300 mb-4 leading-relaxed" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 text-gray-300" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 text-gray-300" {...props} />,
                    li: ({node, ...props}) => <li className="mb-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-[#35DE57] font-bold" {...props} />,
                    em: ({node, ...props}) => <em className="text-[#87CEEB] italic" {...props} />,
                    code: ({node, ...props}) => <code className="bg-[#002147] px-2 py-1 rounded text-[#35DE57]" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#35DE57] pl-4 italic text-gray-400 mb-4" {...props} />,
                    a: ({node, ...props}) => <a className="text-[#35DE57] hover:text-[#2bc948] underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    hr: ({node, ...props}) => <hr className="border-t-2 border-[#35DE57]/30 my-8" {...props} />,
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-gray-300 text-base leading-relaxed w-full space-y-4">
                {article.content.split('\n\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="mb-4 text-gray-300 leading-relaxed">
                      {paragraph}
                    </p>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Source Link */}
          {article.url && (
            <div className="mt-8 pt-6 border-t border-[#35DE57]/20">
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#35DE57] hover:text-[#2bc948] transition-colors font-semibold"
              >
                <HiDocument />
                View Original Source
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#35DE57]/30 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#35DE57] text-[#001433] font-bold rounded-lg hover:bg-[#2bc948] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleReader;
