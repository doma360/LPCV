import { prisma } from "@/lib/prisma.js";
import { Errors } from "@/utils/errors.js";
import type { RegisterDeviceInput } from "./devices.schema.js";

export function registerDevice(userId: string, role: "client" | "professionnel", input: RegisterDeviceInput) {
  const ownerField = role === "client" ? { clientId: userId } : { professionnelId: userId };
  return prisma.appareil.upsert({
    where: { token: input.token },
    create: { token: input.token, plateforme: input.plateforme, ...ownerField },
    update: { plateforme: input.plateforme, derniereUtilisation: new Date(), ...ownerField },
  });
}

export async function removeDevice(id: string, userId: string, role: "client" | "professionnel") {
  const device = await prisma.appareil.findUnique({ where: { id } });
  if (!device) throw Errors.notFound();

  const owns = role === "client" ? device.clientId === userId : device.professionnelId === userId;
  if (!owns) throw Errors.forbidden();

  await prisma.appareil.delete({ where: { id } });
}
