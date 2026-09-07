export const Button = ({ children, onClick, variant = "primary", className = "", disabled = false }) => {
  const baseStyle = "px-4 py-3 rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-2 w-full disabled:opacity-50 disabled:cursor-not-allowed";

  let variantStyle = "bg-accent hover:bg-accent-dark text-white shadow-lg shadow-accent/20"; // default primary
  if (variant === "secondary") variantStyle = "bg-slate-700 hover:bg-slate-600 text-slate-200";
  if (variant === "success") variantStyle = "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20";
  if (variant === "warning") variantStyle = "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20";
  if (variant === "danger") variantStyle = "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50";
  if (variant === "outline") variantStyle = "border border-slate-600 text-slate-300 hover:bg-slate-800";

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variantStyle} ${className}`}>
      {children}
    </button>
  );
};
