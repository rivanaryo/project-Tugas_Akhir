import { z } from 'zod';

export const dimensionsSchema = z.object({
  length_cm: z.number().finite().positive('Panjang harus lebih dari 0').max(10000, 'Maksimal 10.000 cm'),
  width_cm: z.number().finite().positive('Lebar harus lebih dari 0').max(10000, 'Maksimal 10.000 cm'),
  height_cm: z.number().finite().positive('Tinggi harus lebih dari 0').max(10000, 'Maksimal 10.000 cm'),
});
export const boxSchema = z.object({
  box_id: z.string().trim().min(1, 'Kode box wajib diisi').max(80),
  name: z.string().trim().min(1, 'Nama box wajib diisi').max(150),
  dimensions: dimensionsSchema,
  allow_rotation: z.boolean(),
});
export const fleetSchema = z.object({
  fleet_id: z.string().trim().min(1, 'Kode armada wajib diisi').max(80),
  name: z.string().trim().min(1, 'Nama armada wajib diisi').max(150),
  dimensions: dimensionsSchema,
});
export const fleetProfileSchema = z.object({
  spk_number: z.string().trim().min(1, 'Nomor SPK wajib diisi').max(80),
  container: fleetSchema,
  items: z.array(boxSchema).max(500, 'Maksimal 500 box').superRefine((items, ctx) => {
    const seen = new Set<string>();
    items.forEach((item, index) => {
      if (seen.has(item.box_id)) ctx.addIssue({ code: 'custom', path: [index, 'box_id'], message: 'Kode box harus unik' });
      seen.add(item.box_id);
    });
  }),
});
export type Dimensions = z.infer<typeof dimensionsSchema>;
export type CargoBox = z.infer<typeof boxSchema>;
export type FleetProfile = z.infer<typeof fleetProfileSchema>;
export type Fleet = z.infer<typeof fleetSchema>;
export const STORAGE_KEY = 'erparque.fleet-profiler.v1';
export const WORKSPACE_STORAGE_KEY = 'erparque.fleet-workspace.v2';
export const workspaceSchema = z.object({
  profile: fleetProfileSchema,
  fleets: z.array(fleetSchema).min(1, 'Minimal satu armada').max(100, 'Maksimal 100 armada'),
}).superRefine(({ profile, fleets }, ctx) => {
  if (new Set(fleets.map((fleet) => fleet.fleet_id)).size !== fleets.length) ctx.addIssue({ code: 'custom', path: ['fleets'], message: 'Kode armada harus unik' });
  if (!fleets.some((fleet) => fleet.fleet_id === profile.container.fleet_id)) ctx.addIssue({ code: 'custom', path: ['profile', 'container'], message: 'Armada aktif tidak ditemukan' });
}).transform(({ profile, fleets }) => ({ fleets, profile: { ...profile, container: fleets.find((fleet) => fleet.fleet_id === profile.container.fleet_id)! } }));
export type FleetWorkspace = z.infer<typeof workspaceSchema>;
export const workspaceFromProfile = (profile: FleetProfile): FleetWorkspace => ({ profile, fleets: [profile.container] });
export const parseWorkspaceImport = (payload: unknown): FleetWorkspace => {
  if (payload && typeof payload === 'object' && 'profile' in payload) return workspaceSchema.parse(payload);
  return workspaceFromProfile(fleetProfileSchema.parse(payload));
};
export const initialFleetProfile: FleetProfile = {
  spk_number: 'SPK-2026-10-001',
  container: { fleet_id: 'FLEET-001', name: 'Pickup Gran Max Standard', dimensions: { length_cm: 200, width_cm: 130, height_cm: 120 } },
  items: [
    { box_id: 'BOX-SD-001', name: 'Atasan SD Kls 1-3', dimensions: { length_cm: 50, width_cm: 40, height_cm: 30 }, allow_rotation: true },
    { box_id: 'BOX-SD-002', name: 'Atasan SD Kls 4-6', dimensions: { length_cm: 50, width_cm: 40, height_cm: 30 }, allow_rotation: true },
    { box_id: 'BOX-SD-003', name: 'Celana Panjang SD', dimensions: { length_cm: 45, width_cm: 35, height_cm: 25 }, allow_rotation: true },
    { box_id: 'BOX-SD-004', name: 'Rok Merah Rempel', dimensions: { length_cm: 45, width_cm: 35, height_cm: 25 }, allow_rotation: true },
  ],
};
export const format = (value: number, digits = 2) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: digits }).format(value);
export const cargoColors = ['#22d3ee', '#34d399', '#fbbf24', '#818cf8'];
export function downloadJson(payload: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const volumeM3 = (d: Dimensions) => d.length_cm * d.width_cm * d.height_cm / 1_000_000;
export const fitsIndividually = (box: CargoBox, container: Dimensions) => {
  const cargo = [box.dimensions.length_cm, box.dimensions.width_cm, box.dimensions.height_cm];
  const space = [container.length_cm, container.width_cm, container.height_cm];
  if (box.allow_rotation) { cargo.sort((a, b) => a - b); space.sort((a, b) => a - b); }
  return cargo.every((dimension, index) => dimension <= space[index]);
};

export const demoPrediction = {
  mode: 'hardcoded-demo' as const,
  spk_number: initialFleetProfile.spk_number,
  container: structuredClone(initialFleetProfile.container),
  placements: initialFleetProfile.items.map((box, index) => ({
    box: structuredClone(box),
    order: index + 1,
    layer: 1,
    position_cm: [{ x: 0, y: 0, z: 0 }, { x: 50, y: 0, z: 0 }, { x: 0, y: 40, z: 0 }, { x: 45, y: 40, z: 0 }][index],
  })),
};
