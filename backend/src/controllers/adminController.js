const supabase = require("../config/supabase");

/* ================================
   GET ALL PENDING LAWYERS
================================ */
exports.getPendingLawyers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("lawyer_profiles")
      .select(`
        id,
        enrollment_number,
        certificate_url,
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
        created_at,
        users!inner (
          name,
          email,
          phone
        )
      `)
      .eq("status", "PENDING"); // ✅ Changed from PENDING_VERIFICATION

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    res.json(data || []);
  } catch (err) {
    console.error("Get pending lawyers error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   APPROVE / REJECT LAWYER
================================ */
exports.reviewLawyer = async (req, res) => {
  try {
    const { lawyerId, status, admin_comment } = req.body;

    // ✅ Validate status matches ENUM values
    if (!["VERIFIED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be VERIFIED or REJECTED" });
    }

    // Prepare update data
    const updateData = {
      status,
      admin_comment: status === "REJECTED" ? admin_comment : null,
    };

    const { error } = await supabase
      .from("lawyer_profiles")
      .update(updateData)
      .eq("id", lawyerId);

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    res.json({
      success: true,
      message:
        status === "VERIFIED"
          ? "Lawyer verified successfully"
          : "Lawyer rejected successfully",
    });
  } catch (err) {
    console.error("Review lawyer error:", err);
    res.status(500).json({ message: err.message });
  }
};