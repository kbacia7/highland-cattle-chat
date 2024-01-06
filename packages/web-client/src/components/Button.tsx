import { cx } from "class-variance-authority";

type Props = {
  type: "primary" | "secondary";
  children: React.ReactNode;
  className?: string;
};

const Button = ({ type, children, className }: Props) => (
  <button
    className={cx(
      "md:rounded-md text-center py-4 min-w-[150px] transition-colors",
      className,
      {
        "bg-blue-500 text-white hover:bg-blue-400": type === "primary",
        "bg-blue-300 text-blue-900 hover:bg-blue-200": type === "secondary",
      },
    )}
  >
    {children}
  </button>
);

export default Button;
