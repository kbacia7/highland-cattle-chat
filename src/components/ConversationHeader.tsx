import { component$ } from "@builder.io/qwik";
import ProfileImage from "./ProfileImage";

export default component$(() => (
  <div class="w-full h-[74px] bg-white py-3 px-5 drop-shadow-lg">
    <ProfileImage src="/hedgehog.jpg" size={50} />
    <h2 class="inline ml-5 font-bold">Mr. Hedgehod</h2>
  </div>
));
