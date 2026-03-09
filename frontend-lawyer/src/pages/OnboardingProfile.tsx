import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import indiaStatesCities from "../assets/indiaStatesCities.json";
import api from "../api/axios";

const LANGUAGES = [
  "English",
  "Hindi",
  "Marathi",
  "Tamil",
  "Telugu",
  "Gujarati",
  "Kannada",
];

const PRACTICE_AREAS = [
  "Criminal Law",
  "Civil Law",
  "Family Law",
  "Corporate Law",
  "Property Law",
  "Tax Law",
  "Labour Law",
  "Consumer Law",
];

const TAGS = [
  "Divorce",
  "Property Dispute",
  "Criminal Defense",
  "Contract Review",
  "Cheque Bounce",
  "Consumer Rights",
  "Employment Issues",
  "Startup Legal",
];

const COURTS = [
  "District Court",
  "High Court",
  "Supreme Court",
  "Family Court",
  "Consumer Court",
  "Sessions Court",
];

const EXPERIENCE_OPTIONS = [
  "0–1 years",
  "2–4 years",
  "5–7 years",
  "8–10 years",
  "10+ years",
];

export default function OnboardingProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [courts, setCourts] = useState<string[]>([]);

  // Debug: Check authentication status
  useEffect(() => {
    if (!user) {
      console.warn("User not authenticated, redirecting to login");
      navigate("/login");
      return;
    }
    
    if (user.role !== "lawyer") {
      console.warn("User is not a lawyer, redirecting");
      navigate("/");
      return;
    }

    // Log token for debugging (remove in production)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      console.log("User authenticated:", {
        id: user.id,
        email: user.email,
        role: user.role,
        hasToken: !!parsed?.token,
        tokenLength: parsed?.token?.length || 0
      });
    }
  }, [user, navigate]);

  const toggle = (
    value: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(
      list.includes(value)
        ? list.filter((i) => i !== value)
        : [...list, value]
    );
  };

  const handleNext = async () => {
    if (
      !state ||
      !city ||
      !languages.length ||
      !areas.length ||
      !experience ||
      !courts.length
    ) {
      alert("Please complete all required fields");
      return;
    }

    try {
      const response = await api.post("/lawyer/profile", {
        state,
        city,
        languages,
        practiceAreas: areas,
        caseTypes: tags,
        experience,
        courts,
        available: true,
      });

      if (response.data.success) {
        navigate("/onboarding/photo");
      }
    } catch (error: any) {
      console.error("Profile save error:", error);
      
      // Better error handling
      if (error.response?.status === 401) {
        alert("Authentication failed. Please login again.");
        // Optionally redirect to login
        window.location.href = "/login";
      } else if (error.response?.data?.message) {
        alert(`Failed to save profile: ${error.response.data.message}`);
      } else {
        alert("Failed to save profile. Please check your connection and try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Complete Your Lawyer Profile</h1>
          <p className="text-sm text-gray-600">
            Help clients find and trust you
          </p>
          <div className="mt-4 h-2 bg-gray-200 rounded">
            <div className="h-2 bg-indigo-600 rounded w-[25%]" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-10">

          {/* LOCATION */}
          <section>
            <h2 className="text-lg font-semibold">Location & Languages</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setCity("");
                }}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select State</option>
                {Object.keys(indiaStatesCities).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>

              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!state}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select City</option>
                {state &&
                  indiaStatesCities[state as keyof typeof indiaStatesCities].map(
                    (c) => (
                      <option key={c}>{c}</option>
                    )
                  )}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  onClick={() => toggle(l, languages, setLanguages)}
                  className={`px-4 py-1.5 rounded-full border ${
                    languages.includes(l)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </section>

          {/* PROFESSIONAL */}
          <section>
            <h2 className="text-lg font-semibold">Professional Details</h2>

            {/* Years of Experience */}
            <p className="mt-4 text-sm font-medium text-gray-600">
              Years of Experience
            </p>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="mt-2 border rounded-lg px-3 py-2 w-full"
            >
              <option value="">Select experience</option>
              {EXPERIENCE_OPTIONS.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>

            {/* Practice Courts */}
            <p className="mt-6 text-sm font-medium text-gray-600">
              Practice Courts
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {COURTS.map((c) => (
                <button
                  key={c}
                  onClick={() => toggle(c, courts, setCourts)}
                  className={`px-4 py-1.5 rounded-full border ${
                    courts.includes(c)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </section>

          {/* PRACTICE AREAS */}
          <section>
            <h2 className="text-lg font-semibold">Practice Areas</h2>
            <p className="mt-4 text-sm font-medium text-gray-600">
              Select the legal domains you specalize in
            </p>
            <div className="flex flex-wrap gap-2">
              {PRACTICE_AREAS.map((p) => (
                <button
                  key={p}
                  onClick={() => toggle(p, areas, setAreas)}
                  className={`px-4 py-1.5 rounded-full border ${
                    areas.includes(p)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </section>

          {/* CASES */}
          <section>
            <h2 className="text-lg font-semibold">Cases & Services</h2>
            <p className="mt-4 text-sm font-medium text-gray-600">
              Choose the types of cases you commonly handle
            </p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggle(t, tags, setTags)}
                  className={`px-4 py-1.5 rounded-full border ${
                    tags.includes(t)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          {/* ACTION */}
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
