import { cx } from "class-variance-authority";

//TODO: Add cva?
type Props = {
  src: string;
  size?: number;
  className?: string;
};

const ProfileImage = ({ src, size = 50, className }: Props) => (
  <img
    className={cx("rounded-full object-cover aspect-square inline", className)}
    width={size}
    height={size}
    src={src}
  />
);

export default ProfileImage;
