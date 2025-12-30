import { HiSparkles } from 'react-icons/hi2';

const Navbar = () => {
  return (
    <nav className="bg-[#001433] border-b-2 border-[#35DE57] py-4 sm:py-6 px-4 sm:px-8 sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3">
        <img 
          src="https://beyondchats.com/wp-content/uploads/2023/12/Beyond_Chats_Logo-removebg-preview.png" 
          alt="BeyondChats Logo" 
          className="h-8 sm:h-10 md:h-12 flex-shrink-0"
        />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white truncate">
          BeyondChats <span className="text-[#35DE57]">Blogs</span>
        </h1>
      </div>
    </nav>
  );
};

export default Navbar;
