const supabase = require("../config/supabase");

/* ================================
   STEP 1: SAVE / UPDATE PROFILE
================================ */
exports.saveProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      state,
      city,
      languages,
      practiceAreas,
      caseTypes,
      experience,
      courts,
    } = req.body;

    console.log("=== SAVE PROFILE DEBUG ===");
    console.log("User ID:", userId);
    console.log("Request Body:", req.body);

    // Validate required fields
    if (!state || !city) {
      return res.status(400).json({ message: "State and city are required" });
    }

    if (!languages || languages.length === 0) {
      return res.status(400).json({ message: "At least one language is required" });
    }

    if (!practiceAreas || practiceAreas.length === 0) {
      return res.status(400).json({ message: "At least one practice area is required" });
    }

    if (!experience) {
      return res.status(400).json({ message: "Experience is required" });
    }

    if (!courts || courts.length === 0) {
      return res.status(400).json({ message: "At least one court is required" });
    }

    // Check if profile exists
    const { data: existing, error: checkError } = await supabase
      .from("lawyer_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle(); // Use maybeSingle() instead of single()

    if (checkError) {
      console.error("Error checking existing profile:", checkError);
      throw checkError;
    }

    console.log("Existing profile:", existing);

    if (!existing) {
      // Create new profile
      console.log("Creating new profile...");
      
      const { data: newProfile, error: insertError } = await supabase
        .from("lawyer_profiles")
        .insert([{
          user_id: userId,
          state,
          city,
          languages,
          practice_areas: practiceAreas,
          case_types: caseTypes || [],
          experience,
          courts,
          status: "PENDING",
        }])
        .select();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      console.log("Profile created successfully:", newProfile);
    } else {
      // Update existing profile
      console.log("Updating existing profile...");
      
      const { data: updatedProfile, error: updateError } = await supabase
        .from("lawyer_profiles")
        .update({
          state,
          city,
          languages,
          practice_areas: practiceAreas,
          case_types: caseTypes || [],
          experience,
          courts,
          status: "PENDING",
          admin_comment: null,
        })
        .eq("user_id", userId)
        .select();

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      console.log("Profile updated successfully:", updatedProfile);
    }

    res.json({ success: true, message: "Profile saved successfully" });
  } catch (err) {
    console.error("=== SAVE PROFILE ERROR ===");
    console.error("Error:", err);
    res.status(500).json({ 
      message: err.message || "Failed to save profile",
      error: err.toString()
    });
  }
};

/* ================================
   STEP 2: SAVE PHOTO
================================ */
exports.savePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoUrl } = req.body;

    const { error } = await supabase
      .from("lawyer_profiles")
      .update({ profile_photo_url: photoUrl })
      .eq("user_id", userId);

    if (error) throw error;

    res.json({ success: true, message: "Photo saved successfully" });
  } catch (err) {
    console.error("Save photo error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   STEP 3: ACCEPT TERMS
================================ */
exports.acceptTerms = async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabase
      .from("lawyer_profiles")
      .update({ accepted_terms: true })
      .eq("user_id", userId);

    if (error) throw error;

    res.json({ success: true, message: "Terms accepted successfully" });
  } catch (err) {
    console.error("Accept terms error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   STEP 4: COMPLETE ONBOARDING
================================ */
exports.completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const { available } = req.body;

    const { error } = await supabase
      .from("lawyer_profiles")
      .update({
        is_available: available,
        status: "PENDING",
      })
      .eq("user_id", userId);

    if (error) throw error;

    res.json({ success: true, message: "Onboarding completed successfully" });
  } catch (err) {
    console.error("Complete onboarding error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   DASHBOARD PROFILE
================================ */
exports.getLawyerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("lawyer_profiles")
      .select(`
        status,
        admin_comment,
        state,
        city,
        languages,
        practice_areas,
        case_types,
        experience,
        courts,
        profile_photo_url,
        enrollment_number,
        certificate_url,
        is_available,
        users!inner (
          name,
          email,
          phone
        )
      `)
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      profile: data,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   ONBOARDING STATUS
================================ */
exports.getOnboardingStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("lawyer_profiles")
      .select("accepted_terms, is_available")
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    res.json({
      completed: data?.accepted_terms === true && data?.is_available === true,
    });
  } catch (err) {
    console.error("Get onboarding status error:", err);
    res.status(500).json({ message: err.message });
  }
};