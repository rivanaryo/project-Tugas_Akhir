import { useRef, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { ArrowLeft, ArrowUpRight, Box, Boxes, ChevronRight, Code2, Download, Layers, RotateCcw, Save, ShieldCheck, Truck, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { BinStudioPage } from './BinStudioPage';
import { BoxTablePage, FleetTablePage } from './FleetTables';
import { downloadJson, initialFleetProfile, parseWorkspaceImport, STORAGE_KEY, WORKSPACE_STORAGE_KEY, workspaceFromProfile, workspaceSchema, type FleetWorkspace } from './fleetProfile';
import './fleet-profiler.css';

const navigation = [
  { to: '/fleet-profiler/studio', label: '3D Bin Studio', icon: Boxes, description: 'Visualisasi penempatan dan prediksi muatan contoh hardcoded.' },
  { to: '/fleet-profiler', label: 'Fleet Profiler', icon: Truck, description: 'Kelola armada dan dimensi ruang muat dalam satu tabel.' },
  { to: '/fleet-profiler/boxes', label: 'Daftar Box', icon: Box, description: 'Kelola data box, ukuran, dan karakteristik kargo.' },
];

function loadWorkspace(): FleetWorkspace {
  if (typeof window !== 'undefined') {
    for (const key of [WORKSPACE_STORAGE_KEY, STORAGE_KEY]) {
      try {
        const saved = localStorage.getItem(key);
        if (saved) return parseWorkspaceImport(JSON.parse(saved));
      } catch { continue; }
    }
  }
  return workspaceFromProfile(structuredClone(initialFleetProfile));
}

function WorkspaceNavigation({ boxCount, fleetCount }: { boxCount: number; fleetCount: number }) {
  return <>
    {navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end className={({ isActive }) => isActive ? 'fp-nav-active' : ''}>
      <Icon className="h-4 w-4 shrink-0" /><span>{label}</span>
      <span className="fp-nav-count">{to.endsWith('/studio') ? 'DEMO' : to.endsWith('/boxes') ? boxCount : fleetCount}</span>
    </NavLink>)}
    <Link to="/dashboard"><ArrowLeft className="h-4 w-4 shrink-0" />Dashboard ERP<ArrowUpRight className="ml-auto h-3.5 w-3.5" /></Link>
  </>;
}

export function FleetProfilerPage() {
  const [workspace, setWorkspace] = useState<FleetWorkspace>(loadWorkspace);
  const [dirty, setDirty] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [json, setJson] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const { pathname } = useLocation();
  const currentPath = pathname.replace(/\/+$/, '');
  const current = navigation.find((item) => item.to === currentPath) ?? navigation[1];
  const Icon = current.icon;
  const update = (next: FleetWorkspace) => { setWorkspace(next); setDirty(true); };
  const applyImport = () => {
    try {
      update(parseWorkspaceImport(JSON.parse(json)));
      setJsonOpen(false);
      setJsonError('');
      toast.success('Data JSON berhasil diimpor ke workspace.');
    } catch (error) {
      setJsonError(error instanceof z.ZodError ? error.issues.slice(0, 6).map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n') : 'JSON tidak valid. Periksa tanda kutip, koma, dan struktur data.');
    }
  };
  const save = () => {
    try {
      localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspaceSchema.parse(workspace)));
      setDirty(false);
      toast.success('Seluruh armada dan box disimpan di perangkat ini.');
    } catch { toast.error('Penyimpanan tidak tersedia. Gunakan Ekspor JSON untuk menyimpan data.'); }
  };

  return <div className="fp-app">
    <header className="fp-topbar">
      <Link to="/fleet-profiler/studio" className="fp-brand"><Boxes className="h-7 w-7" /><span>LOAD<span className="text-white">OPT</span><small>LOGISTICS WORKSPACE</small></span></Link>
      <div className="fp-top-tab"><Icon className="h-4 w-4" />{current.label}</div>
      <div className="fp-top-actions"><span className="fp-local"><span />LOCAL WORKSPACE</span><Button asChild variant="secondary" size="sm"><Link to="/dashboard"><ArrowLeft className="h-3.5 w-3.5" />Kembali ke ERP</Link></Button></div>
    </header>
    <div className="fp-shell">
      <aside className="fp-sidebar">
        <div className="fp-workspace-card"><span className="fp-icon"><Truck className="h-5 w-5" /></span><div><strong>Logistics Workspace</strong><span>ARMADA · BOX · STUDIO</span></div></div>
        <p className="fp-nav-caption">WORKSPACE</p>
        <nav aria-label="Navigasi Logistics Workspace"><WorkspaceNavigation boxCount={workspace.profile.items.length} fleetCount={workspace.fleets.length} /></nav>
        <div className="fp-sidebar-note"><Layers className="h-5 w-5 text-blue-400" /><strong>Satu workspace, tiga halaman.</strong><p>Kelola armada dan box di tabel masing-masing. Lihat ilustrasi prediksi di Studio dalam mode demo.</p><span className="fp-outline-badge">LOCAL DATA / DEMO STUDIO</span></div>
        <div className="fp-sidebar-bottom"><ShieldCheck className="h-4 w-4 shrink-0" /><span>Data lokal · tanpa koneksi API</span></div>
      </aside>
      <main className="fp-main">
        <nav className="fp-mobile-nav" aria-label="Navigasi workspace mobile"><WorkspaceNavigation boxCount={workspace.profile.items.length} fleetCount={workspace.fleets.length} /></nav>
        <div className="fp-breadcrumb"><span>Logistik</span><ChevronRight /><span>Workspace</span><ChevronRight /><strong>{current.label}</strong></div>
        <div className="fp-page-heading"><div><div className="fp-eyebrow">ARMADA & KARAKTERISTIK KARGO</div><h1>{current.label}<span className="fp-version">{currentPath.endsWith('/studio') ? 'DEMO' : 'V.02'}</span></h1><p>{current.description}</p></div>
          <div className="fp-page-actions"><Button variant="secondary" size="sm" onClick={() => { setJson(''); setJsonError(''); setJsonOpen(true); }}><Upload className="h-3.5 w-3.5" />Impor JSON</Button><Button variant="secondary" size="sm" onClick={() => setExportOpen(true)}><Download className="h-3.5 w-3.5" />Ekspor JSON</Button><Button size="sm" onClick={save}><Save className="h-3.5 w-3.5" />Simpan Lokal</Button></div>
        </div>
        <div className="fp-workspace-status"><span className="fp-outline-badge">{dirty ? 'PERUBAHAN BELUM DISIMPAN' : 'DATA LOKAL / CONTOH'}</span><span>Profil aktif: {workspace.profile.container.fleet_id} · {workspace.profile.spk_number}</span></div>
        <Routes>
          <Route index element={<FleetTablePage workspace={workspace} onChange={update} />} />
          <Route path="studio" element={<BinStudioPage />} />
          <Route path="boxes" element={<BoxTablePage workspace={workspace} onChange={update} />} />
          <Route path="*" element={<Navigate to="/fleet-profiler" replace />} />
        </Routes>
        <footer className="fp-main-footer"><span>LOADOPT / LOGISTICS WORKSPACE<span className="fp-footer-divider">/</span>{workspace.profile.container.fleet_id}</span><button onClick={() => setResetOpen(true)}><RotateCcw className="h-3 w-3" />Muat Ulang Contoh</button><span><Code2 className="h-3.5 w-3.5" />JSON COMPATIBLE</span></footer>
      </main>
    </div>
    <Dialog open={jsonOpen} onOpenChange={setJsonOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Impor Profil / Workspace JSON</DialogTitle><DialogDescription>Menerima profil spk_number, container, items atau backup workspace berisi profile dan fleets. Impor mengganti data kerja semua halaman; ekspor dahulu untuk menyimpan perubahan.</DialogDescription></DialogHeader>
      <div className="my-4 space-y-3">
        <input ref={fileInput} type="file" accept=".json,application/json" className="hidden" aria-label="Pilih file JSON" onChange={async (event) => {
          const input = event.currentTarget;
          const file = input.files?.[0];
          if (!file) return;
          if (file.size > 1_000_000) { setJsonError('Ukuran file maksimal 1 MB.'); input.value = ''; return; }
          try { setJson(await file.text()); setJsonError(''); } catch { setJsonError('File tidak dapat dibaca.'); }
          input.value = '';
        }} />
        <Button type="button" variant="secondary" size="sm" onClick={() => fileInput.current?.click()}><Upload className="h-3.5 w-3.5" />Pilih File JSON</Button><Label htmlFor="profile-json" className="block">Atau tempel JSON</Label>
        <Textarea id="profile-json" rows={12} maxLength={1_000_000} className="font-mono text-xs" value={json} onChange={(event) => { setJson(event.target.value); setJsonError(''); }} placeholder={'{ "spk_number": "...", "container": { ... }, "items": [] }'} />
        {jsonError && <p role="alert" className="fp-error whitespace-pre-wrap">{jsonError}</p>}
      </div><DialogFooter><Button variant="secondary" onClick={() => setJsonOpen(false)}>Batal</Button><Button onClick={applyImport} disabled={!json.trim()}>Ganti Data dengan JSON<ArrowUpRight className="h-4 w-4" /></Button></DialogFooter>
    </DialogContent></Dialog>
    <Dialog open={exportOpen} onOpenChange={setExportOpen}><DialogContent><DialogHeader><DialogTitle>Ekspor JSON</DialogTitle><DialogDescription>Pilih data yang ingin diunduh. Backup workspace menyertakan seluruh armada, sedangkan profil hanya menyertakan armada aktif dan daftar box.</DialogDescription></DialogHeader><div className="my-5 grid gap-3"><Button variant="secondary" onClick={() => downloadJson(workspace.profile, `${workspace.profile.container.fleet_id}-profile.json`)}><Download className="h-4 w-4" />Ekspor Profil Aktif</Button><Button onClick={() => downloadJson(workspace, 'loadopt-workspace.json')}><Download className="h-4 w-4" />Backup Seluruh Workspace</Button></div></DialogContent></Dialog>
    <Dialog open={resetOpen} onOpenChange={setResetOpen}><DialogContent><DialogHeader><DialogTitle>Muat Ulang Data Contoh?</DialogTitle><DialogDescription>Semua armada dan box di workspace kerja akan diganti satu Pickup Gran Max dan empat box contoh. Backup workspace terlebih dahulu jika ingin menyimpan perubahan.</DialogDescription></DialogHeader><DialogFooter><Button variant="secondary" onClick={() => setResetOpen(false)}>Batal</Button><Button onClick={() => { update(workspaceFromProfile(structuredClone(initialFleetProfile))); setResetOpen(false); }}>Muat Contoh</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
