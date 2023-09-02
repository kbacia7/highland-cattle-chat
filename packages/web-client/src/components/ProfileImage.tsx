import { cx } from "class-variance-authority";

//TODO: Add cva?
type Props = {
  src: string;
  size: number;
};

const ProfileImage = ({ src, size = 50 }: Props) => (
  <img
    className={cx("rounded-full object-cover aspect-square inline")}
    width={size}
    height={size}
    src={src}
  />
);

export default ProfileImage;
