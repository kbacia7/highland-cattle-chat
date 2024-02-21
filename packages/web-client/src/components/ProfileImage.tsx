import { cx } from "class-variance-authority";

interface Props extends React.ComponentPropsWithRef<"img"> {
  src: string;
  size?: number;
  className?: string;
}

const ProfileImage = ({ src, size = 50, className, ...props }: Props) => (
  <img
    className={cx("rounded-full object-cover aspect-square inline", className)}
    width={size}
    height={size}
    src={src}
    {...props}
  />
);

export default ProfileImage;
