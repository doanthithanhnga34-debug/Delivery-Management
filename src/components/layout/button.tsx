export function TokbokkiButton({
  onClick,
  children,
}: {
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="
      w-full
        relative group
        px-8 py-3.5 

        rounded-full 
      
        bg-gradient-to-b from-white via-amber-50 to-amber-100/80

        border-t-2 border-white
        border-x border-amber-200/60
       
        shadow-[0_10px_20px_-3px_rgba(245,158,11,0.25),0_4px_6px_-2px_rgba(0,0,0,0.05),inset_0_-4px_6px_0_rgba(251,191,36,0.3)]
        
        transition-all duration-150 ease-out
        hover:-translate-y-0.5
        hover:shadow-[0_14px_24px_-3px_rgba(245,158,11,0.35),0_6px_8px_-2px_rgba(0,0,0,0.08),inset_0_-4px_6px_0_rgba(251,191,36,0.3)]
        active:translate-y-1.5
        active:shadow-[0_2px_4px_0_rgba(245,158,11,0.2),inset_0_2px_4px_0_rgba(0,0,0,0.1)]
        active:border-t-transparent
        cursor-pointer
        select-none
      "
    >

      <div className="absolute top-1.5 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-white to-transparent rounded-full opacity-70 pointer-events-none" />

      <span className="relative flex items-center justify-center gap-2 text-amber-900 font-extrabold text-sm tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
        <span className="text-lg"></span>
        {children || "Tạo Phiếu "}
      </span>
    </button>
  );
}
