import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  const triggerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { isOpen, setIsOpen, triggerRef })
      )}
    </div>
  );
};

const DropdownMenuTrigger = React.forwardRef(
  ({ className, children, isOpen, setIsOpen, triggerRef, ...props }, ref) => {
    return (
      <button
        ref={(node) => {
          if (triggerRef) triggerRef.current = node;
          if (ref) {
            if (typeof ref === 'function') ref(node);
            else ref.current = node;
          }
        }}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = React.forwardRef(
  ({ className, align = 'end', isOpen, setIsOpen, triggerRef, ...props }, ref) => {
    const [position, setPosition] = React.useState({ top: 0, left: 0 });

    React.useEffect(() => {
      if (isOpen && triggerRef?.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const menuHeight = 150; // Altura estimada del menú
        const spaceBelow = viewportHeight - rect.bottom;

        // Si no hay suficiente espacio abajo, abrirlo hacia arriba
        const shouldOpenUpward = spaceBelow < menuHeight;

        setPosition({
          top: shouldOpenUpward ? rect.top - menuHeight - 2 : rect.bottom + 2,
          left: align === 'end' ? rect.right - 128 : rect.left
        });
      }
    }, [isOpen, align, triggerRef]);

    if (!isOpen) return null;

    return createPortal(
      <div
        ref={ref}
        className={cn(
          'fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md animate-in fade-in-0 zoom-in-95',
          className
        )}
        style={{
          top: position.top,
          left: position.left,
        }}
        {...props}
      />,
      document.body
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef(
  ({ className, setIsOpen, onClick, ...props }, ref) => {
    const handleClick = (e) => {
      onClick?.(e);
      setIsOpen?.(false);
    };

    return (
      <button
        ref={ref}
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        )}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-gray-100', className)}
      {...props}
    />
  )
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

const DropdownMenuLabel = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-2 py-1.5 text-sm font-semibold', className)}
      {...props}
    />
  )
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};