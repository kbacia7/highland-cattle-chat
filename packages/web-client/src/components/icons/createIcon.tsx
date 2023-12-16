type IconProps = {
  viewBox: string;
  className?: string;
  size?:
    | {
        width: number;
        height: number;
      }
    | number;
};

export function createIcon(
  iconName: string,
  viewBox: string,
  WrappedComponent: React.ReactElement,
) {
  const IconComponent = ({ size, ...props }: Partial<IconProps>) => (
    <svg
      height={typeof size === "number" ? size : size?.height || 24}
      width={typeof size === "number" ? size : size?.width || 24}
      viewBox={viewBox}
      className={props.className}
    >
      {WrappedComponent}
    </svg>
  );

  IconComponent.displayName = `createIcon(${iconName}Icon)`;

  return IconComponent;
}
