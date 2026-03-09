import axios from "./axios";

/* ================================
   SAVE PROFILE (Step 1)
================================ */
export const saveProfile = async (data: {
  state: string;
  city: string;
  languages: string[];
  practiceAreas: string[];
  caseTypes: string[];
  experience: string;
  courts: string[];
}) => {
  const res = await axios.post("/lawyer/profile", data);
  return res.data;
};

/* ================================
   SAVE PHOTO (Step 2)
================================ */
export const savePhoto = async (photo: File) => {
  const formData = new FormData();
  formData.append("photo", photo);

  const res = await axios.post("/lawyer/photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

/* ================================
   ACCEPT TERMS (Step 3)
================================ */
export const acceptTerms = async () => {
  const res = await axios.post("/lawyer/terms");
  return res.data;
};

/* ================================
   COMPLETE ONBOARDING (Step 4)
================================ */
export const completeOnboarding = async (available: boolean) => {
  const res = await axios.post("/lawyer/complete", { available });
  return res.data;
};

/* ================================
   GET LAWYER NAME (Dashboard)
================================ */
export const getLawyerProfile = async () => {
  const res = await axios.get("/lawyer/profile");
  return res.data;
};
