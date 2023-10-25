const Card = ({ title, icon, description, buttonText, onClick }) => {
  return (
    <div className="grid grid-cols-1 divide-y max-w-full w-full pb-0 bg-white border border-gray-200 rounded-xl shadow md:min-h-full md:max-w-full">
      <div className="p-8">
        <div className="grid grid-cols-1 mb-4 items-center">
          <div className="flex items-center">
            {icon}
            <h5 className="ml-2 text-md font-bold tracking-tight text-gray-900">
              {title}
            </h5>
          </div>
          <p className="my-2 text-md">{description}</p>
        </div>
        <div className="mb-6">
          {/* Content specific to your card component */}
        </div>
        <div className="grid justify-end bg-[#FBFBFB] py-2 px-8">
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none"
            onClick={onClick}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
