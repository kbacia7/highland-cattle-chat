const MessageBox = ({ text }: { text: string }) => (
  <div className="relative py-7 px-4 text-center rounded-full bg-blue-100 border-blue-300 border text-blue-900 w-64 font-bold text-lg leading-tight z-10">
    <p>{text}</p>
  </div>
);

export default MessageBox;
