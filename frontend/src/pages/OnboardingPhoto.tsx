import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const OnboardingPhoto = () => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleNext = async () => {
    try {
      if (photo) {
        const formData = new FormData();
        formData.append("photo", photo);

        await api.post("/lawyer/photo", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      navigate("/onboarding/legal");
    } catch (err) {
      console.error(err);
      alert("Failed to upload photo");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Complete Your Lawyer Profile
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Help clients find and trust you
        </p>

        <div className="mt-4 h-2 bg-gray-200 rounded">
          <div className="h-2 bg-indigo-600 rounded w-[50%]" />
        </div>
      </div>

      {/* PHOTO CARD */}
      <div className="bg-white rounded-xl p-8 border">
        <h2 className="text-lg font-semibold text-gray-900">
          Add a Profile Photo
        </h2>
        <p className="text-sm text-gray-600 mb-8">
          Optional, but recommended to build trust with clients
        </p>

        <div className="flex flex-col items-center gap-5">
          <div className="w-40 h-40 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm text-gray-500 text-center px-4">
                Upload your photo
              </span>
            )}
          </div>

          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <span className="px-6 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100">
              Choose Photo
            </span>
          </label>

          <p className="text-xs text-gray-500">
            JPG or PNG • Max size 5MB
          </p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-between">
        <button
          onClick={() => navigate("/onboarding/profile")}
          className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700"
        >
          Back
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-2 rounded-lg bg-indigo-600 text-white"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OnboardingPhoto;
