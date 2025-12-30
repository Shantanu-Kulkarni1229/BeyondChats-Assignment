import { HiSparkles, HiEye, HiBookOpen, HiArrowsRightLeft, HiTrash, HiDocument } from 'react-icons/hi2';

const ArticleCard = ({ article, onEnhance, onView, onDelete, onCompare, isEnhanced = false, isSelected = false, onToggleSelect }) => {
  // Fix word count calculation - properly handle all text
  const getWordCount = (text) => {
    if (!text || typeof text !== 'string') return 0;
    // Remove extra whitespace and split by any whitespace
    const words = text.trim().replace(/\s+/g, ' ').split(' ');
    return words.filter(word => word.length > 0).length;
  };

  return (
    <div 
      className={`${
        isEnhanced 
          ? 'bg-gradient-to-br from-[#002147] to-[#001433] border-2 border-[#35DE57] hover:shadow-lg hover:shadow-[#35DE57]/20' 
          : 'bg-[#002147] border-2 border-[#35DE57]/30 hover:border-[#35DE57]'
      } rounded-lg overflow-hidden transition-all relative group ${
        isSelected ? 'ring-4 ring-[#35DE57]' : ''
      }`}
    >
      {/* Selection checkbox for original articles */}
      {!isEnhanced && onToggleSelect && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(article._id)}
            className="w-5 h-5 accent-[#35DE57] cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      
      {/* Delete button in top right */}}
      <button
        onClick={() => onDelete(article)}
        className="absolute top-3 right-3 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-[#001433]/80 p-2 rounded-full"
        title="Delete article"
      >
        <HiTrash className="text-lg" />
      </button>

      {/* Article Image */}
      {article.image && (
        <div className="w-full h-48 overflow-hidden bg-gray-800">
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-6">
        {isEnhanced && (
          <div className="flex items-center gap-2 mb-3">
            <HiSparkles className="text-[#35DE57]" />
            <span className="px-3 py-1 bg-[#35DE57] text-[#001433] text-xs font-bold rounded-full">
              ENHANCED
            </span>
          </div>
        )}
        
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 pr-8">
          {article.title}
        </h3>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {article.content?.substring(0, 150)}...
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className={isEnhanced ? 'text-[#35DE57]' : 'text-[#87CEEB]'}>
              {new Date(article.date).toLocaleDateString()}
            </span>
            <span className="text-gray-400">
              {getWordCount(article.content)} words
            </span>
          </div>
          {!isEnhanced && article.url && (
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-[#87CEEB] hover:text-[#35DE57] transition-colors flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <HiDocument className="flex-shrink-0" />
              <span>Click here for original article</span>
            </a>
          )}
        </div>
        
        <div className="mt-4 flex gap-2">
          {isEnhanced ? (
            <>
              <button 
                onClick={() => onView(article)}
                className="flex-1 px-4 py-2 bg-[#87CEEB] text-[#001433] font-semibold rounded hover:bg-[#6bb8d9] transition-colors text-sm flex items-center justify-center gap-2"
              >
                <HiBookOpen />
                Read Full
              </button>
              <button 
                onClick={() => onCompare(article)}
                className="px-4 py-2 border border-[#35DE57] text-[#35DE57] font-semibold rounded hover:bg-[#35DE57]/10 transition-colors text-sm flex items-center gap-2"
              >
                <HiArrowsRightLeft />
                Compare
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => onEnhance(article)}
                className="flex-1 px-4 py-2 bg-[#35DE57] text-[#001433] font-semibold rounded hover:bg-[#2bc948] transition-colors text-sm flex items-center justify-center gap-2"
              >
                <HiSparkles />
                Enhance
              </button>
              <button 
                onClick={() => onView(article)}
                className="px-4 py-2 border border-[#87CEEB] text-[#87CEEB] font-semibold rounded hover:bg-[#87CEEB]/10 transition-colors text-sm flex items-center gap-2"
              >
                <HiEye />
                View
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
