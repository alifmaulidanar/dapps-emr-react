const BackButton = ({ linkToPage }) => {
  return (
    <a href={linkToPage} className="w-fit">
      <button
        type="button"
        className="text-gray-900 border border-1 border-gray-600 hover:border-gray-900 bg-transparent hover:bg-gray-200 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-1.5 text-center flex items-center gap-x-2"
        // onClick={handleEditClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
          />
        </svg>
        Kembali
      </button>
    </a>
  );
};

export default BackButton;
