import { useId, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { boxSchema, cargoColors, fleetSchema, format, type CargoBox, type Dimensions, type Fleet } from './fleetProfile';

export function Panel({ title, subtitle, icon, action, children, className = '' }: { title: string; subtitle?: string; icon: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`fp-panel ${className}`}>
    <div className="fp-panel-heading">
      <div className="flex min-w-0 items-center gap-3"><span className="fp-icon">{icon}</span><div className="min-w-0"><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>
      {action}
    </div>
    {children}
  </section>;
}

const dimensionFields = [['length_cm', 'Panjang'], ['width_cm', 'Lebar'], ['height_cm', 'Tinggi']] as const;

export function BoxEditor({ initial, onSave, onClose, existingIds }: { initial: CargoBox; onSave: (box: CargoBox) => void; onClose: () => void; existingIds: string[] }) {
  const { register, handleSubmit, setError, formState: { errors } } = useForm<CargoBox>({ resolver: zodResolver(boxSchema), defaultValues: initial });
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent><DialogHeader><DialogTitle>Profil Box</DialogTitle><DialogDescription>Satu baris adalah satu box fisik. Dimensi dalam sentimeter.</DialogDescription></DialogHeader>
    <form className="mt-4 space-y-4" onSubmit={handleSubmit((box) => {
      if (existingIds.includes(box.box_id)) { setError('box_id', { message: 'Kode box sudah digunakan' }); return; }
      onSave(box);
    })}>
      <div className="space-y-2"><Label htmlFor="box-id">Kode Box</Label><Input id="box-id" autoFocus {...register('box_id')} />{errors.box_id && <p className="fp-error">{errors.box_id.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="box-name">Nama Barang</Label><Input id="box-name" {...register('name')} />{errors.name && <p className="fp-error">{errors.name.message}</p>}</div>
      <div className="grid grid-cols-3 gap-3">{dimensionFields.map(([key, label]) => <div key={key} className="space-y-2"><Label htmlFor={`box-${key}`}>{label} (cm)</Label><Input id={`box-${key}`} type="number" min="0.01" max="10000" step="any" {...register(`dimensions.${key}`, { valueAsNumber: true })} />{errors.dimensions?.[key] && <p className="fp-error">{errors.dimensions[key]?.message}</p>}</div>)}</div>
      <label className="flex items-start gap-3 rounded-xl border border-border bg-surface-2/40 p-3 text-sm"><input type="checkbox" className="mt-1 accent-blue-500" {...register('allow_rotation')} /><span>Izinkan Rotasi<span className="mt-1 block text-xs text-text">Box boleh diubah orientasinya saat pengecekan dimensi.</span></span></label>
      <DialogFooter><Button type="button" variant="secondary" onClick={onClose}>Batal</Button><Button type="submit">Simpan Box</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>;
}

export function FleetEditor({ initial, existingIds, onSave, onClose }: { initial: Fleet; existingIds: string[]; onSave: (fleet: Fleet) => void; onClose: () => void }) {
  const { register, handleSubmit, setError, formState: { errors } } = useForm<Fleet>({ resolver: zodResolver(fleetSchema), defaultValues: initial });
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent><DialogHeader><DialogTitle>Profil Armada</DialogTitle><DialogDescription>Masukkan dimensi internal bak kendaraan, bukan dimensi luar kendaraan.</DialogDescription></DialogHeader>
    <form className="mt-4 space-y-4" onSubmit={handleSubmit((fleet) => {
      if (existingIds.includes(fleet.fleet_id)) { setError('fleet_id', { message: 'Kode armada sudah digunakan' }); return; }
      onSave(fleet);
    })}>
      <div className="space-y-2"><Label htmlFor="fleet-id">Kode Armada</Label><Input id="fleet-id" autoFocus {...register('fleet_id')} />{errors.fleet_id && <p className="fp-error">{errors.fleet_id.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="fleet-name">Nama Armada</Label><Input id="fleet-name" {...register('name')} />{errors.name && <p className="fp-error">{errors.name.message}</p>}</div>
      <div className="grid grid-cols-3 gap-3">{dimensionFields.map(([key, label]) => <div key={key} className="space-y-2"><Label htmlFor={`fleet-${key}`}>{label} (cm)</Label><Input id={`fleet-${key}`} type="number" min="0.01" max="10000" step="any" {...register(`dimensions.${key}`, { valueAsNumber: true })} />{errors.dimensions?.[key] && <p className="fp-error">{errors.dimensions[key]?.message}</p>}</div>)}</div>
      <DialogFooter><Button type="button" variant="secondary" onClick={onClose}>Batal</Button><Button type="submit">Simpan Armada</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>;
}

export type PreviewView = 'iso' | 'top' | 'side';
export interface PreviewPlacement { box: CargoBox; x: number; y: number; z: number }
export function CargoPreview({ dimensions, view, placements = [], selectedId, onSelect }: { dimensions: Dimensions; view: PreviewView; placements?: PreviewPlacement[]; selectedId?: string; onSelect?: (id: string) => void }) {
  const uid = useId().replace(/:/g, '');
  const { length_cm: length, width_cm: width, height_cm: height } = dimensions;
  const scale = 210 / Math.max(length, width, height);
  const p = (x: number, y: number, z = 0) => view === 'iso' ? [310 + (x - y) * scale * 0.82, 235 + (x + y) * scale * 0.35 - z * scale * 0.75] : view === 'top' ? [180 + x * scale, 110 + y * scale] : [180 + x * scale, 320 - z * scale];
  const points = (vertices: number[][]) => vertices.map((v) => p(v[0], v[1], v[2] ?? 0).join(',')).join(' ');
  const floor = [[0, 0], [length, 0], [length, width], [0, width]];
  return <svg viewBox="0 0 680 440" className="fp-preview-svg" role="img" aria-label={`Preview bak ${length} kali ${width} kali ${height} cm${placements.length ? ', penempatan box demo hardcoded' : ', ruang muat kosong'}`}>
    <defs><pattern id={`${uid}-grid`} width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" fill="#334155" /></pattern><linearGradient id={`${uid}-floor`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#0c3960" stopOpacity=".7" /><stop offset="1" stopColor="#0b1422" /></linearGradient></defs>
    <rect width="680" height="440" fill={`url(#${uid}-grid)`} />
    {view !== 'side' && <polygon points={points(floor)} fill={`url(#${uid}-floor)`} stroke="#38bdf8" strokeWidth="1.5" />}
    {view !== 'top' && <><polygon points={points([[0, width, 0], [length, width, 0], [length, width, height], [0, width, height]])} fill="#2563eb" fillOpacity=".08" stroke="#3b82f6" strokeWidth="1.5" /><polygon points={points([[length, 0, 0], [length, width, 0], [length, width, height], [length, 0, height]])} fill="#22d3ee" fillOpacity=".05" stroke="#38bdf8" strokeWidth="1.5" />{view === 'iso' && <polygon points={points([[0, 0, height], [length, 0, height], [length, width, height], [0, width, height]])} fill="none" stroke="#38bdf8" strokeDasharray="5 5" opacity=".65" />}</>}
    {[...placements].sort((a, b) => a.y - b.y || a.x - b.x).map(({ box, x, y, z }, index) => {
      const { length_cm: l, width_cm: w, height_cm: h } = box.dimensions;
      const color = cargoColors[index % cargoColors.length];
      const selected = selectedId === box.box_id;
      const label = p(x + l / 2, y + w / 2, z + h);
      return <g key={box.box_id} className={onSelect ? 'fp-preview-box' : undefined} onClick={() => onSelect?.(box.box_id)}>
        <title>{box.box_id}: {box.name}</title>
        {view !== 'top' && <><polygon points={points([[x, y + w, z], [x + l, y + w, z], [x + l, y + w, z + h], [x, y + w, z + h]])} fill={color} fillOpacity=".6" stroke={selected ? '#fff' : color} /><polygon points={points([[x + l, y, z], [x + l, y + w, z], [x + l, y + w, z + h], [x + l, y, z + h]])} fill={color} fillOpacity=".4" stroke={selected ? '#fff' : color} /></>}
        {view !== 'side' && <polygon points={points([[x, y, z + h], [x + l, y, z + h], [x + l, y + w, z + h], [x, y + w, z + h]])} fill={color} fillOpacity=".85" stroke={selected ? '#fff' : '#0c1017'} strokeWidth={selected ? 2 : 1} />}
        <text x={label[0]} y={label[1] + 5} textAnchor="middle" fill="#06101b" style={{ fontSize: 11, fontWeight: 700 }}>{index + 1}</text>
      </g>;
    })}
    <text x="340" y="394" textAnchor="middle" fill="#7dd3fc">P {format(length)} cm × L {format(width)} cm × T {format(height)} cm</text>
    <text x="340" y="418" textAnchor="middle" fill="#64748b">{placements.length ? 'DEMO HARDCODED · BUKAN HASIL ALGORITMA' : 'PREVIEW DIMENSI · RUANG MUAT KOSONG'}</text>
  </svg>;
}
