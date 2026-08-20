import type { Request, Response } from "express";
import { created, ok } from "@/utils/response.js";
import { Errors } from "@/utils/errors.js";
import { registerDeviceSchema } from "./devices.schema.js";
import * as devicesService from "./devices.service.js";

function assertMobileRole(req: Request): "client" | "professionnel" {
  if (req.auth?.role !== "client" && req.auth?.role !== "professionnel") {
    throw Errors.forbidden("Réservé aux comptes client et professionnel");
  }
  return req.auth.role;
}

export async function registerDeviceHandler(req: Request, res: Response) {
  const role = assertMobileRole(req);
  const input = registerDeviceSchema.parse(req.body);
  const device = await devicesService.registerDevice(req.auth!.sub, role, input);
  return created(res, device, "Appareil enregistré");
}

export async function removeDeviceHandler(req: Request, res: Response) {
  const role = assertMobileRole(req);
  await devicesService.removeDevice(req.params.id, req.auth!.sub, role);
  return ok(res, null, "Appareil supprimé");
}
