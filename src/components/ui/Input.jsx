export const Input = ({ label, value, onChange, type = "text", placeholder = "", step = "1", min }) => (
  <div className="flex flex-col gap-1 mb-3 w-full">
    <label className="text-slate-400 text-sm font-medium ml-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      step={step}
      min={min}
      className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all w-full"
    />
  </div>
);
