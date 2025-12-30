import ArticleCard from './ArticleCard';
import { HiDocumentText, HiSparkles } from 'react-icons/hi2';

const ArticlesGrid = ({ 
  articles, 
  loading, 
  title, 
  icon, 
  emptyMessage, 
  emptySubMessage,
  onEnhance,
  onView,
  onDelete,
  onCompare,
  isEnhanced = false,
  selectedArticles = [],
  onToggleSelect
}) => {
  const IconComponent = icon === 'document' ? HiDocumentText : HiSparkles;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
        <IconComponent className={`text-3xl sm:text-4xl ${isEnhanced ? 'text-[#35DE57]' : 'text-[#87CEEB]'}`} />
        <span className="truncate">{title}</span>
        <span className={`${isEnhanced ? 'text-[#35DE57]' : 'text-[#87CEEB]'} text-lg sm:text-xl flex-shrink-0`}>
          ({articles.length})
        </span>
      </h2>
      
      {loading ? (
        <div className="text-white text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#35DE57]"></div>
          <p className="mt-4 text-sm sm:text-base">Loading articles...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-gray-400 text-center py-8 sm:py-12 bg-[#002147]/50 rounded-lg border-2 border-dashed border-[#35DE57]/30 px-4">
          <IconComponent className="text-5xl sm:text-6xl mx-auto mb-4 text-[#35DE57]/30" />
          <p className="text-base sm:text-lg">{emptyMessage}</p>
          {emptySubMessage && <p className="text-xs sm:text-sm mt-2">{emptySubMessage}</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {articles.map((article) => (
            <ArticleCard
              key={article._id}
              article={article}
              onEnhance={onEnhance}
              onView={onView}
              onDelete={onDelete}
              onCompare={onCompare}
              isEnhanced={isEnhanced}
              isSelected={selectedArticles.includes(article._id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticlesGrid;
