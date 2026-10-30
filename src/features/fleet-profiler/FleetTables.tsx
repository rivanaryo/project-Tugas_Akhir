import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Boxes, Check, ChevronLeft, ChevronRight, Eye, Info, Pencil, Plus, Search, Trash2, Truck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { BoxEditor, CargoPreview, FleetEditor, Panel } from './FleetWorkspaceParts';
import { fitsIndividually, fleetProfileSchema, format, volumeM3, type CargoBox, type Fleet, type FleetWorkspace } from './fleetProfile';

interface WorkspaceProps { workspace: FleetWorkspace; onChange: (workspace: FleetWorkspace) => void }
const dimensionsText = (fleet: Fleet | CargoBox) => `${format(fleet.dimensions.length_cm)} × ${format(fleet.dimensions.width_cm)} × ${format(fleet.dimensions.height_cm)} cm`;
function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (page: number) => void }) {
  const last = Math.max(1, Math.ceil(total / 10));
  return <div className="fp-table-pagination"><span>{total ? `${(page - 1) * 10 + 1}–${Math.min(page * 10, total)}` : '0'} dari {total} data</span><div><Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft className="h-4 w-4" />Sebelumnya</Button><span>{page} / {last}</span><Button variant="secondary" size="sm" disabled={page >= last} onClick={() => onChange(page + 1)}>Selanjutnya<ChevronRight className="h-4 w-4" /></Button></div></div>;
}
function DeleteDialog({ label, onClose, onConfirm }: { label: string; onClose: () => void; onConfirm: () => void }) {
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent><DialogHeader><DialogTitle>Hapus Data?</DialogTitle><DialogDescription>Hapus {label} dari workspace lokal ini? Perubahan dapat disimpan melalui Simpan Lokal.</DialogDescription></DialogHeader><DialogFooter><Button variant="secondary" onClick={onClose}>Batal</Button><Button variant="destructive" onClick={onConfirm}>Hapus</Button></DialogFooter></DialogContent></Dialog>;
}

export function FleetTablePage({ workspace, onChange }: WorkspaceProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<{ index: number | null; fleet: Fleet } | null>(null);
  const [deleting, setDeleting] = useState<Fleet | null>(null);
  const [preview, setPreview] = useState<Fleet | null>(null);
  const { fleets, profile } = workspace;
  const filtered = fleets.map((fleet, index) => ({ fleet, index })).filter(({ fleet }) => `${fleet.fleet_id} ${fleet.name}`.toLowerCase().includes(search.trim().toLowerCase()));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / 10)));
  const rows = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  const saveFleet = (fleet: Fleet) => {
    if (!editing) return;
    const previous = editing.index === null ? undefined : fleets[editing.index];
    const nextFleets = editing.index === null ? [...fleets, fleet] : fleets.map((item, index) => index === editing.index ? fleet : item);
    const nextProfile = previous?.fleet_id === profile.container.fleet_id ? { ...profile, container: fleet } : profile;
    onChange({ fleets: nextFleets, profile: nextProfile });
    setEditing(null);
  };
  return <>
    <div className="fp-summary-strip"><div><Truck className="h-5 w-5" /><span><strong>{fleets.length} armada</strong><small>Terdaftar di workspace lokal</small></span></div><div><Check className="h-5 w-5" /><span><strong>{profile.container.fleet_id}</strong><small>Armada aktif untuk profil JSON</small></span></div><div><Boxes className="h-5 w-5" /><span><strong>{format(volumeM3(profile.container.dimensions), 3)} m³</strong><small>Kapasitas bak armada aktif</small></span></div></div>
    <Panel title="Tabel Armada" subtitle="Kelola armada dan dimensi internal ruang muat" icon={<Truck className="h-5 w-5" />} action={<Button size="sm" disabled={fleets.length >= 100} onClick={() => setEditing({ index: null, fleet: { fleet_id: `FLEET-${crypto.randomUUID().slice(0, 6).toUpperCase()}`, name: '', dimensions: { length_cm: 200, width_cm: 130, height_cm: 120 } } })}><Plus className="h-4 w-4" />Tambah Armada</Button>}>
      <div className="fp-table-toolbar"><div className="fp-table-search"><Search className="h-4 w-4" /><Input aria-label="Cari armada" placeholder="Cari kode atau nama armada..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div><span className="fp-outline-badge">{fleets.length} / 100 ARMADA</span></div>
      <div className="fp-data-table-wrap"><table className="fp-data-table"><thead><tr><th>No.</th><th>Kode Armada</th><th>Nama Armada</th><th>Dimensi P × L × T</th><th>Volume Bak</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{rows.map(({ fleet, index }, row) => {
        const active = fleet.fleet_id === profile.container.fleet_id;
        return <tr key={fleet.fleet_id} className={active ? 'fp-active-row' : ''}><td>{(currentPage - 1) * 10 + row + 1}</td><td className="fp-code">{fleet.fleet_id}</td><td>{fleet.name}</td><td className="whitespace-nowrap">{dimensionsText(fleet)}</td><td>{format(volumeM3(fleet.dimensions), 3)} m³</td><td>{active ? <span className="fp-rotation">Aktif</span> : <Button size="sm" variant="secondary" onClick={() => onChange({ ...workspace, profile: { ...profile, container: fleet } })}>Gunakan</Button>}</td><td><div className="fp-row-actions"><Button variant="ghost" size="sm" aria-label={`Preview ${fleet.fleet_id}`} onClick={() => setPreview(fleet)}><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="sm" aria-label={`Edit ${fleet.fleet_id}`} onClick={() => setEditing({ index, fleet })}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="sm" className="text-rose-400" disabled={active} title={active ? 'Pilih armada lain sebelum menghapus armada aktif' : 'Hapus armada'} aria-label={`Hapus ${fleet.fleet_id}`} onClick={() => setDeleting(fleet)}><Trash2 className="h-4 w-4" /></Button></div></td></tr>;
      })}{rows.length === 0 && <tr><td colSpan={7} className="fp-empty">Tidak ada armada yang cocok dengan pencarian.</td></tr>}</tbody></table></div>
      <Pagination page={currentPage} total={filtered.length} onChange={setPage} />
    </Panel>
    <div className="fp-notice"><Info className="h-5 w-5 shrink-0" /><div><strong>Data armada terpisah dari simulasi demo</strong><p>Armada aktif menentukan profil JSON dan pemeriksaan dimensi di Daftar Box. Hasil 3D Bin Studio saat ini memakai data contoh tetap, bukan armada yang diubah di tabel ini.</p></div><Button asChild variant="secondary" size="sm"><Link to="/fleet-profiler/studio">Buka Studio</Link></Button></div>
    {editing && <FleetEditor initial={editing.fleet} existingIds={fleets.filter((_, index) => index !== editing.index).map((fleet) => fleet.fleet_id)} onClose={() => setEditing(null)} onSave={saveFleet} />}
    {deleting && <DeleteDialog label={deleting.fleet_id} onClose={() => setDeleting(null)} onConfirm={() => { onChange({ ...workspace, fleets: fleets.filter((fleet) => fleet.fleet_id !== deleting.fleet_id) }); setDeleting(null); }} />}
    {preview && <Dialog open onOpenChange={(open) => !open && setPreview(null)}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>{preview.name}</DialogTitle><DialogDescription>{preview.fleet_id} · {dimensionsText(preview)} · {format(volumeM3(preview.dimensions), 3)} m³</DialogDescription></DialogHeader><CargoPreview dimensions={preview.dimensions} view="iso" /></DialogContent></Dialog>}
  </>;
}

const spkSchema = fleetProfileSchema.pick({ spk_number: true });
function SpkForm({ value, onSave }: { value: string; onSave: (value: string) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<{ spk_number: string }>({ resolver: zodResolver(spkSchema), defaultValues: { spk_number: value } });
  return <form className="fp-spk-form" onSubmit={handleSubmit(({ spk_number }) => onSave(spk_number))}><div><Label htmlFor="box-spk">Referensi SPK</Label><Input id="box-spk" {...register('spk_number')} />{errors.spk_number && <p className="fp-error">{errors.spk_number.message}</p>}</div><Button type="submit" variant="secondary" size="sm">Terapkan SPK</Button></form>;
}

export function BoxTablePage({ workspace, onChange }: WorkspaceProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<{ index: number | null; box: CargoBox } | null>(null);
  const [deleting, setDeleting] = useState<CargoBox | null>(null);
  const { profile } = workspace;
  const filtered = profile.items.map((box, index) => ({ box, index })).filter(({ box }) => `${box.box_id} ${box.name}`.toLowerCase().includes(search.trim().toLowerCase()));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / 10)));
  const rows = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  const incompatible = profile.items.filter((box) => !fitsIndividually(box, profile.container.dimensions)).length;
  const updateItems = (items: CargoBox[]) => onChange({ ...workspace, profile: { ...profile, items } });
  return <>
    <div className="fp-summary-strip"><div><Box className="h-5 w-5" /><span><strong>{profile.items.length} box</strong><small>Satu entri untuk satu box fisik</small></span></div><div><Boxes className="h-5 w-5" /><span><strong>{format(profile.items.reduce((sum, box) => sum + volumeM3(box.dimensions), 0), 4)} m³</strong><small>Total volume seluruh box</small></span></div><div><Truck className="h-5 w-5" /><span><strong>{profile.container.fleet_id}</strong><small>{profile.container.name}</small></span></div></div>
    <Panel title="Tabel Box" subtitle="Kelola kode, nama, ukuran, dan izin rotasi box" icon={<Box className="h-5 w-5" />} action={<Button size="sm" disabled={profile.items.length >= 500} onClick={() => setEditing({ index: null, box: { box_id: `BOX-${crypto.randomUUID().slice(0, 6).toUpperCase()}`, name: '', dimensions: { length_cm: 50, width_cm: 40, height_cm: 30 }, allow_rotation: true } })}><Plus className="h-4 w-4" />Tambah Box</Button>}>
      <div className="fp-table-toolbar"><div className="fp-table-search"><Search className="h-4 w-4" /><Input aria-label="Cari box" placeholder="Cari kode box atau nama barang..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div><span className="fp-outline-badge">{profile.items.length} / 500 BOX</span></div>
      <div className="fp-data-table-wrap"><table className="fp-data-table"><thead><tr><th>No.</th><th>Kode Box</th><th>Nama Barang</th><th>Dimensi P × L × T</th><th>Volume</th><th>Rotasi</th><th>Cek Individual</th><th>Aksi</th></tr></thead><tbody>{rows.map(({ box, index }, row) => <tr key={box.box_id}><td>{(currentPage - 1) * 10 + row + 1}</td><td className="fp-code">{box.box_id}</td><td>{box.name}</td><td className="whitespace-nowrap">{dimensionsText(box)}</td><td>{format(volumeM3(box.dimensions), 4)} m³</td><td>{box.allow_rotation ? <span className="fp-rotation">Boleh</span> : <span className="fp-muted">Tetap</span>}</td><td className={fitsIndividually(box, profile.container.dimensions) ? 'fp-fit' : 'fp-error'}>{fitsIndividually(box, profile.container.dimensions) ? 'Sesuai dimensi bak' : 'Melebihi dimensi bak'}</td><td><div className="fp-row-actions"><Button size="sm" variant="ghost" aria-label={`Edit ${box.box_id}`} onClick={() => setEditing({ index, box })}><Pencil className="h-4 w-4" /></Button><Button size="sm" variant="ghost" className="text-rose-400" aria-label={`Hapus ${box.box_id}`} onClick={() => setDeleting(box)}><Trash2 className="h-4 w-4" /></Button></div></td></tr>)}{rows.length === 0 && <tr><td colSpan={8} className="fp-empty">{profile.items.length ? 'Tidak ada box yang cocok dengan pencarian.' : 'Belum ada box. Klik Tambah Box untuk memulai.'}</td></tr>}</tbody></table></div>
      <Pagination page={currentPage} total={filtered.length} onChange={setPage} />
    </Panel>
    <div className="fp-box-reference"><SpkForm key={profile.spk_number} value={profile.spk_number} onSave={(spk_number) => onChange({ ...workspace, profile: { ...profile, spk_number } })} /><p><Info className="h-4 w-4 shrink-0" />{incompatible ? `${incompatible} box melebihi dimensi bak. ` : ''}Pemeriksaan per box bukan jaminan seluruh box bisa dimuat bersama. Data demo Studio terpisah dari daftar ini.</p></div>
    {editing && <BoxEditor initial={editing.box} existingIds={profile.items.filter((_, index) => index !== editing.index).map((box) => box.box_id)} onClose={() => setEditing(null)} onSave={(box) => { updateItems(editing.index === null ? [...profile.items, box] : profile.items.map((item, index) => index === editing.index ? box : item)); setEditing(null); }} />}
    {deleting && <DeleteDialog label={deleting.box_id} onClose={() => setDeleting(null)} onConfirm={() => { updateItems(profile.items.filter((box) => box.box_id !== deleting.box_id)); setDeleting(null); }} />}
  </>;
}
