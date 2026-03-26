import type { ReactNode, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

type SelectFieldProps = {
  label: string;
  children: ReactNode;
} & SelectHTMLAttributes<HTMLSelectElement>;

export function SelectField({ label, children, className = "", ...props }: Readonly<SelectFieldProps>) {
  return (
    <label>
      <span className="label">{label}</span>
      <div className="select-shell">
        <select className={`input select-input ${className}`.trim()} {...props}>
          {children}
        </select>
        <ChevronDown className="select-icon h-4 w-4" />
      </div>
    </label>
  );
}
