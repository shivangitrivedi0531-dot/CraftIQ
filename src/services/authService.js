import { apiRequest } from "./api";

export async function signupService({ fullName, email, password }) {
  return await apiRequest("/auth/signup", {
    method: "POST",
    body: {
      display_name: fullName,
      email,
      password,
    },
  });
}

export async function loginService({ email, password }) {
  return await apiRequest("/auth/login", {
    method: "POST",
    body: {
      email,
      password,
    },
  });
}

export async function googleLoginService(idToken) {
  return await apiRequest("/auth/google", {
    method: "POST",
    body: {
      id_token: idToken,
    },
  });
}

export async function googleCodeLoginService(code) {
  return await apiRequest("/auth/google/code", {
    method: "POST",
    body: {
      code,
    },
  });
}



export async function getProfileService(token) {
  return await apiRequest("/profile", {
    method: "GET",
    token,
  });
}

export async function updateProfileService(token, { display_name }) {
  return await apiRequest("/profile", {
    method: "PUT",
    token,
    body: {
      display_name,
    },
  });
}
