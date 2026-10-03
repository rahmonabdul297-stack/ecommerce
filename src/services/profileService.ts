import { api } from "@/lib/apiClient";
import type { Address, ApiSuccess } from "@/lib/types";

export interface UserProfile {
  _id?: string;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  date?: string;
  bio?: string;
  profileImage?: string;
  addresses: Address[];
}

function normalizeAddresses(value: unknown): Address[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): Address[] => {
    if (!entry || typeof entry !== "object") return [];
    const address = entry as Record<string, unknown>;
    if (
      typeof address._id !== "string" ||
      typeof address.street !== "string" ||
      typeof address.city !== "string" ||
      typeof address.state !== "string"
    ) {
      return [];
    }

    return [
      {
        _id: address._id,
        street: address.street,
        city: address.city,
        state: address.state,
        country: typeof address.country === "string" ? address.country : "",
        postalCode:
          typeof address.postalCode === "string"
            ? address.postalCode
            : undefined,
        isDefault: address.isDefault === true,
      },
    ];
  });
}

function normalizeProfile(value: unknown): UserProfile {
  if (!value || typeof value !== "object") {
    throw new Error("The profile response did not include a user.");
  }

  const response = value as Record<string, unknown>;
  const user = (
    response.user && typeof response.user === "object"
      ? response.user
      : response
  ) as Record<string, unknown>;

  return {
    _id: typeof user._id === "string" ? user._id : undefined,
    name: typeof user.name === "string" ? user.name : "",
    username: typeof user.username === "string" ? user.username : "",
    email: typeof user.email === "string" ? user.email : "",
    phone: typeof user.phone === "string" ? user.phone : "",
    date: typeof user.date === "string" ? user.date : "",
    bio: typeof user.bio === "string" ? user.bio : "",
    profileImage:
      typeof user.profileImage === "string"
        ? user.profileImage
        : typeof user.image === "string"
          ? user.image
          : "",
    addresses: normalizeAddresses(user.addresses),
  };
}

/** GET /api/v1/profile/me */
export async function getMyProfile(signal?: AbortSignal): Promise<UserProfile> {
  const res = await api.get<ApiSuccess<unknown>>("/api/v1/profile/me", signal);
  return normalizeProfile(res.data);
}

/** PUT /api/v1/profile/update-profile — multipart form data */
export async function updateMyProfile(form: FormData): Promise<UserProfile> {
  const res = await api.putForm<ApiSuccess<unknown>>(
    "/api/v1/profile/update-profile",
    form,
  );
  return normalizeProfile(res.data);
}
