import { z } from "zod";

export const registerDeviceSchema = z.object({
  token: z.string().min(1),
  plateforme: z.enum(["ANDROID", "IOS"]),
});

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
