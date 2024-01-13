import fakeChat from "~/assets/fake-chat.png";
import github from "~/assets/github.png";

import Button from "~/components/Button";
import Modal from "~/components/Modal";

import RegisterForm from "~/routes/home/containers/RegisterForm";

import MessageBox from "./components/MessageBox";
import RoundedVectorLine from "./components/RoundedVectorLine";
import StraightVectorLine from "./components/StraightVectorLine";

const HomeRoute = () => (
  <>
    <div className="pt-5 pl-8">
      <a
        href="https://github.com/kbacia7/highland-cattle-chat"
        referrerPolicy="no-referrer"
      >
        <img src={github} alt="github" />
      </a>
    </div>
    <main className="flex flex-col xl:flex-row items-center justify-center gap-20 xl:gap-3 absolute top-1/2 -translate-y-1/2 md:relative md:transform-none md:top-0">
      <div className="xl:w-1/3 md:w-1/2 w-full p-3">
        <h1 className="font-bold text-3xl md:text-4xl xl:text-5xl leading-tight tracking-wide md:text-center text-left xl:text-left">
          Are you ready for next-generation communication with friends?
        </h1>
        <div className="md:hidden mt-3">
          <h2 className="text-xl">
            With <span className="font-bold text-blue-500">highLand</span> chat
            you can:
          </h2>
          <ul className="text-base">
            <li>✔️ Stay in contact wherever you are</li>
            <li>✔️ Forget about unnecessary tracking</li>
            <li>✔️ Send photos in high quality</li>
          </ul>
        </div>
        <div className="flex flex-col md:flex-row justify-center md:gap-5 mt-9">
          <Modal
            title="We are happy that you are here!"
            toggleRenderFn={({ openModal }) => (
              <Button onClick={openModal} color="primary">
                Get started
              </Button>
            )}
          >
            <RegisterForm />
          </Modal>

          <Button color="secondary">I have account</Button>
        </div>
      </div>
      <div className="hidden md:flex md:flex-row md:items-center">
        <div className="relative">
          <div className="relative w-64">
            <MessageBox text="Stay in contact wherever you are" />
            <div className="translate-x-1/2 -translate-y-5 text-blue-500">
              <RoundedVectorLine />
            </div>
          </div>
          <div className="relative flex flex-row items-center">
            <MessageBox text="Forget about unnecessary tracking" />
            <div className="text-blue-500">
              <StraightVectorLine />
            </div>
          </div>
          <div className="relative w-64">
            <div className="translate-x-1/2 translate-y-5 text-blue-500 -scale-y-100">
              <RoundedVectorLine />
            </div>
            <MessageBox text="Send photos in high quality" />
          </div>
        </div>

        <img src={fakeChat} alt="fake chat" />
      </div>
    </main>
  </>
);

export default HomeRoute;
