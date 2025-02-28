import { useState } from "react";

export default function ScanIDModal({ isOpen, onClose }) {
  const [image, setImage] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setImage(file);
    // Create a URL for the selected image
    const reader = new FileReader();
    reader.onload = (e) => setImageUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const scanID = async () => {
    if (!image) return;
    setLoading(true);
    setData(null);
    
    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await fetch("https://api.aiforthai.in.th/ocr-id-front-iapp", {
        method: "POST",
        body: formData,
        headers: {
          "Apikey": "v8JzzGJ7B41to0uLMNEuBikVTew3Dy5U",
        },
      });
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Scan Error:", error);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <h2 className="text-xl font-bold text-white">สแกนบัตรประชาชน</h2>
        </div>
        
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* File Upload Area */}
          <div className="mb-6">
            <label 
              htmlFor="id-card-upload" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition duration-300"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className="mb-1 text-sm text-blue-500">
                  <span className="font-semibold">คลิกเพื่ออัปโหลดรูปภาพ</span>
                </p>
                <p className="text-xs text-blue-400">PNG, JPG (สูงสุด 10MB)</p>
              </div>
              <input 
                id="id-card-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </label>
          </div>

          {/* Preview Image */}
          {imageUrl && (
            <div className="mb-6 p-2 border border-gray-200 rounded-lg bg-gray-50">
              <img 
                src={imageUrl} 
                alt="บัตรประชาชนที่อัปโหลด" 
                className="w-full h-48 object-contain rounded" 
              />
            </div>
          )}

          {/* Scan Button */}
          <button
            onClick={scanID}
            disabled={!image || loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
              !image || loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
            } transition duration-300 flex items-center justify-center`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังสแกน...
              </>
            ) : "สแกนข้อมูล"}
          </button>

          {/* Results */}
          {data && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">ผลการสแกน</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-1/3 font-medium text-gray-600">ชื่อ:</span>
                  <span className="w-2/3 text-gray-800">{data.en_name}</span>
                </div>
                <div className="flex">
                  <span className="w-1/3 font-medium text-gray-600">ที่อยู่:</span>
                  <span className="w-2/3 text-gray-800">{data.address}</span>
                </div>
                <div className="flex">
                  <span className="w-1/3 font-medium text-gray-600">วันเกิด:</span>
                  <span className="w-2/3 text-gray-800">{data.en_dob}</span>
                </div>
                <div className="flex">
                  <span className="w-1/3 font-medium text-gray-600">วันหมดอายุ:</span>
                  <span className="w-2/3 text-gray-800">{data.en_expire}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-300"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}