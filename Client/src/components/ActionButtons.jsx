import { HiDocumentText, HiArrowPath, HiSparkles, HiChartBar, HiTrash } from 'react-icons/hi2';

const ActionButtons = ({ 
  onScrape, 
  onRefresh, 
  onEnhanceAll,
  onEnhanceSelected,
  onViewStats,
  onDeleteAll,
  selectedCount = 0
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <button 
          onClick={onScrape}
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#35DE57] text-[#001433] font-bold rounded-lg hover:bg-[#2bc948] transition-colors shadow-lg hover:shadow-[#35DE57]/50 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <HiDocumentText className="text-lg sm:text-xl flex-shrink-0" />
          <span className="truncate">Scrape Blogs</span>
        </button>
        <button 
          onClick={onRefresh}
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#35DE57] text-[#001433] font-bold rounded-lg hover:bg-[#2bc948] transition-colors shadow-lg hover:shadow-[#35DE57]/50 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <HiArrowPath className="text-lg sm:text-xl flex-shrink-0" />
          <span className="truncate">Refresh</span>
        </button>
        <button 
          onClick={onEnhanceAll}
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#87CEEB] text-[#001433] font-bold rounded-lg hover:bg-[#6bb8d9] transition-colors shadow-lg hover:shadow-[#87CEEB]/50 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <HiSparkles className="text-lg sm:text-xl flex-shrink-0" />
          <span className="truncate">Enhance All</span>
        </button>
        <button 
          onClick={onEnhanceSelected}
          disabled={selectedCount === 0}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 font-bold rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base ${
            selectedCount > 0 
              ? 'bg-[#87CEEB] text-[#001433] hover:bg-[#6bb8d9] hover:shadow-[#87CEEB]/50' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          <HiSparkles className="text-lg sm:text-xl flex-shrink-0" />
          <span className="truncate">Selected ({selectedCount})</span>
        </button>
        <button 
          onClick={onViewStats}
          className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-[#35DE57] text-[#35DE57] font-bold rounded-lg hover:bg-[#35DE57] hover:text-[#001433] transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <HiChartBar className="text-lg sm:text-xl flex-shrink-0" />
          <span className="truncate">Stats</span>
        </button>
        <button 
          onClick={onDeleteAll}
          className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm sm:text-base sm:col-span-2 lg:col-span-1"
        >
          <HiTrash className="text-lg sm:text-xl flex-shrink-0" />
          <span className="truncate">Delete All</span>
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
