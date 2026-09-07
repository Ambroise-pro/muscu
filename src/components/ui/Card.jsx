export const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-800/90 rounded-xl2 p-4 shadow-card border border-slate-700/80 ${className}`}>
    {children}
  </div>
);
