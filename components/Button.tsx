import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 font-bold transition-all duration-300 uppercase tracking-widest text-xs md:text-sm font-deco border";
  
  const variants = {
    primary: "bg-gold text-deep border-gold hover:bg-transparent hover:text-gold",
    secondary: "bg-transparent text-gold border-gold hover:bg-gold hover:text-deep",
    danger: "bg-ruby text-white border-ruby hover:bg-transparent hover:text-ruby",
    ghost: "bg-transparent text-gray-400 border-transparent hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  );
};