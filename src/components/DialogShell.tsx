import { useEffect } from "react";

interface DialogShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}

/** Provides the accessible modal frame shared by editors. Example: `<DialogShell title="Edit" ... />`. */
export function DialogShell({ title, description, children, onClose }: DialogShellProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description">
        <header><div><p className="eyebrow">Customize</p><h2 id="dialog-title">{title}</h2><p id="dialog-description">{description}</p></div><button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}>×</button></header>
        {children}
      </section>
    </div>
  );
}
