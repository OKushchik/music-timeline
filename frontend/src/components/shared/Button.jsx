export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  fullWidth = false,
}) {
  const base = 'px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:   'bg-primary hover:bg-indigo-500 text-white focus:ring-primary',
    secondary: 'bg-card hover:bg-slate-700 text-white focus:ring-card',
    danger:    'bg-accent hover:bg-red-600 text-white focus:ring-accent',
    ghost:     'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

