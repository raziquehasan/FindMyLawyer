const BASE = "http://localhost:4000/api";

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!text) throw new Error("Server returned empty response");
  let data;
  try { data = JSON.parse(text); } catch { throw new Error("Invalid response from server"); }
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const authAPI = {
  register: (userData)                => req("POST", "/auth/register", userData),
  login:    (email, password)         => req("POST", "/auth/login", { email, password }),
  google:   (uid, name, email, photo) => req("POST", "/auth/google", { uid, name, email, photo }),
};

export const otpAPI = {
  send:   (phone)      => req("POST", "/otp/send",   { phone }),
  verify: (phone, otp) => req("POST", "/otp/verify", { phone, otp }),
};

export const bookingsAPI = {
  getAll:       (email)      => req("GET",   `/bookings?email=${encodeURIComponent(email)}`),
  create:       (booking)    => req("POST",  "/bookings", booking),
  updateStatus: (id, status) => req("PATCH", `/bookings/${id}/status`, { status }),
};

export const lawyersAPI = {
  getAll: ()   => req("GET", "/lawyers"),
  getOne: (id) => req("GET", `/lawyers/${id}`),
};