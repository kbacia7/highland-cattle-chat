import CloseIcon from "@components/icons/Close";

type Props = {
  image: string;
  onRemove: () => void;
};

const ImagePreview = ({ image, onRemove }: Props) => (
  <div className="w-28 rounded-sm border-blue-300 border-2 relative">
    <button
      onClick={onRemove}
      className="absolute right-0 bg-white rounded-full text-blue-800 "
    >
      <CloseIcon size={18} />
    </button>
    <img src={image} />
  </div>
);

export default ImagePreview;
