import { HiXMark, HiDocumentText, HiSparkles, HiClock, HiCheckCircle, HiXCircle, HiChartBar } from 'react-icons/hi2';

const StatsModal = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  const { articleStats, enhanceStats } = stats || {};

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#001433] border-2 border-[#35DE57] rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#001433] border-b border-[#35DE57]/30 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <HiChartBar className="text-[#35DE57] text-3xl" />
            <h2 className="text-3xl font-bold text-white">Statistics Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#002147] rounded-full"
          >
            <HiXMark className="text-3xl" />
          </button>
        </div>

        <div className="p-8">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Articles */}
            <div className="bg-gradient-to-br from-[#002147] to-[#001433] border-2 border-[#87CEEB] rounded-lg p-6 hover:shadow-lg hover:shadow-[#87CEEB]/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <HiDocumentText className="text-[#87CEEB] text-4xl" />
                <span className="text-[#87CEEB] text-sm font-semibold">TOTAL</span>
              </div>
              <div className="text-5xl font-bold text-white mb-2">
                {articleStats?.totalArticles || 0}
              </div>
              <div className="text-gray-400 text-sm">Total Articles</div>
            </div>

            {/* Enhanced Articles */}
            <div className="bg-gradient-to-br from-[#002147] to-[#001433] border-2 border-[#35DE57] rounded-lg p-6 hover:shadow-lg hover:shadow-[#35DE57]/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <HiSparkles className="text-[#35DE57] text-4xl" />
                <span className="text-[#35DE57] text-sm font-semibold">ENHANCED</span>
              </div>
              <div className="text-5xl font-bold text-white mb-2">
                {enhanceStats?.totalArticles || 0}
              </div>
              <div className="text-gray-400 text-sm">Enhanced Today</div>
            </div>

            {/* Success Rate */}
            <div className="bg-gradient-to-br from-[#002147] to-[#001433] border-2 border-green-500 rounded-lg p-6 hover:shadow-lg hover:shadow-green-500/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <HiCheckCircle className="text-green-500 text-4xl" />
                <span className="text-green-500 text-sm font-semibold">SUCCESS</span>
              </div>
              <div className="text-5xl font-bold text-white mb-2">
                {articleStats?.totalArticles > 0 
                  ? Math.round((enhanceStats?.enhancedToday / articleStats.totalArticles) * 100) 
                  : 0}%
              </div>
              <div className="text-gray-400 text-sm">Enhancement Rate</div>
            </div>
          </div>

          {/* Detailed Article Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Oldest Article */}
            {articleStats?.oldestArticle && (
              <div className="bg-[#002147] border border-[#35DE57]/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <HiClock className="text-[#87CEEB] text-2xl" />
                  <h3 className="text-xl font-bold text-white">Oldest Article</h3>
                </div>
                <div className="text-gray-300 mb-2 line-clamp-2">
                  {articleStats.oldestArticle.title}
                </div>
                <div className="text-[#87CEEB] text-sm">
                  {new Date(articleStats.oldestArticle.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            )}

            {/* Newest Article */}
            {articleStats?.newestArticle && (
              <div className="bg-[#002147] border border-[#35DE57]/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <HiSparkles className="text-[#35DE57] text-2xl" />
                  <h3 className="text-xl font-bold text-white">Newest Article</h3>
                </div>
                <div className="text-gray-300 mb-2 line-clamp-2">
                  {articleStats.newestArticle.title}
                </div>
                <div className="text-[#35DE57] text-sm">
                  {new Date(articleStats.newestArticle.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Enhancement Progress Bar */}
          {articleStats?.totalArticles > 0 && (
            <div className="bg-[#002147] border border-[#35DE57]/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <HiSparkles className="text-[#35DE57]" />
                Enhancement Progress
              </h3>
              <div className="relative w-full h-8 bg-[#001433] rounded-full overflow-hidden border border-[#35DE57]/30">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#35DE57] to-[#2bc948] transition-all duration-500 flex items-center justify-center"
                  style={{ 
                    width: `${Math.min(((enhanceStats?.enhancedToday || 0) / articleStats.totalArticles) * 100, 100)}%` 
                  }}
                >
                  <span className="text-[#001433] font-bold text-sm">
                    {Math.round(((enhanceStats?.enhancedToday || 0) / articleStats.totalArticles) * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>{enhanceStats?.enhancedToday || 0} enhanced</span>
                <span>{articleStats.totalArticles} total</span>
              </div>
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

export default StatsModal;
