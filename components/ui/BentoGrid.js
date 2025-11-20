import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const BentoGrid = ({ className, children }) => {
  return (
    <div
      className={cn(
        // UPDATED:
        // 'max-w-[85%]' constrains width on mobile so it's not edge-to-edge.
        // 'md:max-w-7xl' restores full width on tablets and desktops.
        "grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[85%] md:max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-none",
        "bg-slate-950 border border-slate-800",
        "hover:border-slate-600 hover:bg-slate-900/80",
        "flex flex-col justify-between space-y-0",
        className
      )}
    >
      <div className="w-full h-40 rounded-t-xl overflow-hidden relative bg-slate-900/50 border-b border-slate-800 group-hover/bento:border-slate-700 transition-colors">
        {header}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent pointer-events-none" />
      </div>

      <div className="p-5 flex flex-col gap-3 group-hover/bento:translate-x-1 transition duration-200">
        <div className="w-fit p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 group-hover/bento:text-white group-hover/bento:border-slate-700 transition-colors">
          {icon}
        </div>
        <div>
          <div className="font-sans font-bold text-slate-100 text-lg mb-1">
            {title}
          </div>
          <div className="font-sans font-normal text-slate-400 text-sm leading-relaxed">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};
