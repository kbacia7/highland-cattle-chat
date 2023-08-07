import { component$ } from "@builder.io/qwik";
import Add from "./icons/Add";
import ProfileImage from "./ProfileImage";

export default component$(() => (
  <nav class="h-full bg-blue-500 w-16">
    <ul class="text-center">
      <li>
        <button>
          <Add />
        </button>
      </li>
      <li>
        <button>
          <ProfileImage src="/hedgehog.jpg" size={40} />
        </button>
      </li>
    </ul>
  </nav>
));
