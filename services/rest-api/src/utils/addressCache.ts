import { prisma } from "@backend/database";

export function normalizeAddressKey(address: string) {
  return address.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function getCachedCoords(address: string) {
  const key = normalizeAddressKey(address);
  return prisma.addressCache.findUnique({ where: { key } });
}

export async function setCachedCoords(
  address: string,
  lat: number,
  lon: number
) {
  const key = normalizeAddressKey(address);
  return prisma.addressCache.upsert({
    where: { key },
    create: { key, address, lat, lon },
    update: { address, lat, lon },
  });
}
