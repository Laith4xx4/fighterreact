import { UserDto } from "@/types";

export function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

export function getUserFromToken(token: string, emailFallback?: string): UserDto {
  const payload = decodeJwt(token);
  
  if (!payload) {
    throw new Error("Invalid token");
  }

  // Handle standard .NET Identity claims
  // These are the long URIs often used by ASP.NET Core Identity
  const ClaimTypes = {
    Name: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
    NameIdentifier: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    Email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
    Role: "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
    GivenName: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
    Surname: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
    MobilePhone: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone",
  };

  // Helper to get value from either short key or long claim URI
  const getValue = (keys: string[]) => {
    for (const key of keys) {
      if (payload[key]) return payload[key];
    }
    return undefined;
  };

  const id = getValue(["nameid", "sub", ClaimTypes.NameIdentifier]) || "";
  const email = getValue(["email", ClaimTypes.Email]) || emailFallback || "";
  const userName = getValue(["unique_name", "name", ClaimTypes.Name]) || email;
  const firstName = getValue(["given_name", ClaimTypes.GivenName]);
  const lastName = getValue(["family_name", ClaimTypes.Surname]);
  const phoneNumber = getValue(["phone_number", ClaimTypes.MobilePhone]);
  
  // Role can be a single string or an array of strings
  let role = getValue(["role", ClaimTypes.Role]) || "Member";
  if (Array.isArray(role)) {
    // If user has multiple roles, take the first one or prioritize Admin/Coach?
    // For now, let's take the first one or verify if 'Admin' or 'Coach' is present
    if (role.includes("Admin")) role = "Admin";
    else if (role.includes("Coach")) role = "Coach";
    else role = role[0];
  }

  return {
    id,
    email,
    userName,
    firstName,
    lastName,
    fullName: firstName && lastName 
      ? `${firstName} ${lastName}` 
      : (userName || email),
    phoneNumber,
    role,
  };
}
