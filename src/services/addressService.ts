import { api } from "@/lib/apiClient";
import type { Address, AddressListData, ApiSuccess } from "../lib/types";

export interface CreateAddressPayload {
  street: string;
  city: string;
  state: string;
  country?: string;
  postalCode?: string;
  isDefault?: boolean;
  recipientName?: string;
  recipientPhone?: string;
}

export type UpdateAddressPayload = Partial<CreateAddressPayload>;

const USERS_BASE = "/api/v1/profile";

/** GET /api/v1/users/get-address */
export async function getAddresses(
  signal?: AbortSignal,
): Promise<AddressListData> {
  const res = await api.get<ApiSuccess<AddressListData>>(
    `${USERS_BASE}/get-address`,
    signal,
  );
  return res.data;
}

/** POST /api/v1/users/address — country defaults to Nigeria */
export async function createAddress(
  payload: CreateAddressPayload,
): Promise<Address[]> {
  const res = await api.postJson<ApiSuccess<Address[]>>(
    `${USERS_BASE}/address`,
    payload,
  );
  return res.data;
}

/** PUT /api/v1/users/address/:addressId */
export async function updateAddress(
  addressId: string,
  payload: UpdateAddressPayload,
): Promise<Address[]> {
  const res = await api.putJson<ApiSuccess<Address[]>>(
    `${USERS_BASE}/address/${encodeURIComponent(addressId)}`,
    payload,
  );
  return res.data;
}

/** DELETE /api/v1/users/address/:addressId */
export async function deleteAddress(addressId: string): Promise<Address[]> {
  const res = await api.delete<ApiSuccess<Address[]>>(
    `${USERS_BASE}/address/${encodeURIComponent(addressId)}`,
  );
  return res.data;
}

/** PATCH /api/v1/users/address/:addressId/default */
export async function setDefaultAddress(addressId: string): Promise<Address[]> {
  const res = await api.patchJson<ApiSuccess<Address[]>>(
    `${USERS_BASE}/address/${encodeURIComponent(addressId)}/default`,
    {},
  );
  return res.data;
}
