import { component$ } from "@builder.io/qwik";
import { cx } from "class-variance-authority";

//TODO: Add cva?
export default component$<{ src: string; size: number }>(
  ({ src, size = 50 }) => (
    <img
      class={cx("rounded-full object-cover aspect-square inline")}
      width={size}
      height={size}
      src={src}
    />
  ),
);
