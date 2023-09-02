import Add from "./icons/Add";
import ProfileImage from "./ProfileImage";

import hedgehogImg from "../assets/hedgehog.jpg";

const Nav = () => (
  <nav className="h-full bg-blue-500 w-16">
    <ul className="text-center">
      <li>
        <button>
          <Add />
        </button>
      </li>
      <li>
        <button>
          <ProfileImage src={hedgehogImg} size={40} />
        </button>
      </li>
    </ul>
  </nav>
);

export default Nav;
