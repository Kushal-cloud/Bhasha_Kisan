import React from 'react';

const ImageCapture = ({ onCapture }) => {
  const handleFile = (e) => {
    if (e.target.files[0]) {
      onCapture(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-green-300 border-dashed rounded-lg cursor-pointer bg-green-50 hover:bg-green-100">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <p className="mb-2 text-sm text-green-700">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-green-500">Leaf or Crop Photo (MAX. 5MB)</p>
        </div>
        <input type="file" className="hidden" onChange={handleFile} accept="image/*" />
      </label>
    </div>
  );
};

export default ImageCapture;