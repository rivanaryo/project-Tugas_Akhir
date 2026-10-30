import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Boxes, CheckCircle2, Download, Expand, Info, Layers, Play, RotateCcw, Truck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { CargoPreview, Panel, type PreviewView } from './FleetWorkspaceParts';
import { cargoColors, demoPrediction, downloadJson, format, volumeM3 } from './fleetProfile';

export function BinStudioPage() {
  const [generated, setGenerated] = useState(false);
  const [view, setView] = useState<PreviewView>('iso');
  const [selectedId, setSelectedId] = useState(demoPrediction.placements[0].box.box_id);
  const [expanded, setExpanded] = useState(false);
  const [layer, setLayer] = useState<'all' | 'floor'>('all');
  const demo = demoPrediction;
  const capacity = volumeM3(demo.container.dimensions);
  const usedVolume = demo.placements.reduce((sum, placement) => sum + volumeM3(placement.box.dimensions), 0);
  const ratio = usedVolume / capacity * 100;
  const placements = generated ? demo.placements.map(({ box, position_cm }) => ({ box, ...position_cm })) : [];
  return <>
    <div className="fp-notice fp-demo-notice"><Info className="h-5 w-5 shrink-0" /><div><strong>Mode demo hardcoded — belum terhubung algoritma prediksi</strong><p>Studio memakai contoh tetap Pickup Gran Max + 4 box. Perubahan di Fleet Profiler dan Daftar Box belum memengaruhi hasil ini. Angka di bawah merupakan ilustrasi geometris, bukan rekomendasi pemuatan operasional.</p></div><span className="fp-outline-badge">DEMO ONLY</span></div>
    <section className="fp-studio-config fp-panel" aria-label="Konfigurasi demo">
      <div><span className="fp-eyebrow">ARMADA CONTOH</span><strong><Truck className="h-4 w-4" />{demo.container.name}</strong><p>Bak {demo.container.dimensions.length_cm} × {demo.container.dimensions.width_cm} × {demo.container.dimensions.height_cm} cm</p><Link to="/fleet-profiler">Kelola Armada →</Link></div>
      <div><span className="fp-eyebrow">REFERENSI DEMO</span><strong>{demo.spk_number}</strong><p>{demo.placements.length} box contoh · satu lantai dasar</p><Link to="/fleet-profiler/boxes">Kelola Daftar Box →</Link></div>
      <div><span className="fp-eyebrow">SUMBER PREDIKSI</span><strong>Static Placement / V.01</strong><p>Posisi tersimpan di frontend</p><span className="fp-rotation">Tanpa request API</span></div>
      <div className="fp-studio-run"><Button onClick={() => setGenerated(true)}><Play className="h-4 w-4" />{generated ? 'Tampilkan Ulang Demo' : 'Tampilkan Prediksi Demo'}</Button><Button variant="secondary" disabled={!generated} onClick={() => { setGenerated(false); setSelectedId(demo.placements[0].box.box_id); }}><RotateCcw className="h-4 w-4" />Reset</Button></div>
    </section>
    <div className="fp-metrics">{[
      { label: 'VOLUME TERISI', value: generated ? format(ratio, 1) : '—', unit: generated ? '%' : '', detail: generated ? `${format(usedVolume, 4)} dari ${format(capacity, 3)} m³` : 'Jalankan prediksi demo', icon: <Boxes /> },
      { label: 'SISA VOLUME', value: generated ? format(100 - ratio, 1) : '—', unit: generated ? '%' : '', detail: generated ? `${format(capacity - usedVolume, 4)} m³ secara geometris` : 'Belum ada hasil demo', icon: <Layers /> },
      { label: 'BOX DITEMPATKAN', value: generated ? '4 / 4' : '—', unit: generated ? 'box' : '', detail: 'Hanya 4 box contoh, bukan daftar lokal', icon: <Box /> },
      { label: 'LANTAI MUATAN', value: generated ? '01' : '—', unit: generated ? 'layer' : '', detail: 'Seluruh contoh berada di lantai dasar', icon: <Truck /> },
    ].map((metric) => <div className="fp-metric" key={metric.label}><div><span>{metric.label}</span>{metric.icon}</div><strong>{metric.value}<small>{metric.unit}</small></strong><p>{metric.detail}</p></div>)}</div>
    <div className="fp-workbench">
      <Panel title="Visualisasi 3D Muatan" subtitle="Bak Pickup Gran Max · penempatan contoh statis" icon={<Boxes className="h-5 w-5" />} action={<button className="fp-icon-button" aria-label="Perbesar visualisasi 3D" onClick={() => setExpanded(true)}><Expand className="h-4 w-4" /></button>}>
        <div className="fp-preview-toolbar"><span className="fp-outline-badge"><span className="fp-dot" />{generated ? 'HASIL DEMO' : 'MENUNGGU DEMO'}</span><div className="fp-segmented" role="group" aria-label="Tampilan visualisasi">{([['iso', 'Isometrik'], ['top', 'Atas'], ['side', 'Samping']] as const).map(([key, label]) => <button key={key} className={view === key ? 'active' : ''} aria-pressed={view === key} onClick={() => setView(key)}>{label}</button>)}</div></div>
        <CargoPreview dimensions={demo.container.dimensions} view={view} placements={placements} selectedId={selectedId} onSelect={setSelectedId} />
        <div className="fp-studio-layers"><span>LAYER</span><div className="fp-segmented" role="group" aria-label="Lantai demo"><button className={layer === 'all' ? 'active' : ''} aria-pressed={layer === 'all'} onClick={() => setLayer('all')}>Semua Lantai</button><button className={layer === 'floor' ? 'active' : ''} aria-pressed={layer === 'floor'} onClick={() => setLayer('floor')}>Lantai 1 / Dasar</button></div><small>{layer === 'all' ? 'Demo hanya memiliki 1 lantai.' : 'Semua box berada pada z = 0 cm.'}</small></div>
        <div className="fp-studio-legend">{demo.placements.map(({ box }, index) => <button key={box.box_id} className={selectedId === box.box_id ? 'active' : ''} onClick={() => setSelectedId(box.box_id)} aria-pressed={selectedId === box.box_id}><span className="fp-color-chip" style={{ background: cargoColors[index] }} /><span>{box.box_id}<small>{box.name}</small></span></button>)}</div>
      </Panel>
      <Panel title="Urutan Masuk Barang" subtitle="Urutan ilustratif tetap · bukan hasil optimasi FIFO" icon={<Layers className="h-5 w-5" />} action={<span className="fp-outline-badge">HARDCODED</span>}>
        {!generated ? <div className="fp-studio-empty"><Boxes className="h-12 w-12" /><h3>Siap melihat contoh muatan?</h3><p>Klik Tampilkan Prediksi Demo untuk melihat empat box dan urutan masuk contoh.</p><Button onClick={() => setGenerated(true)}><Play className="h-4 w-4" />Tampilkan Demo</Button></div> : <>
          <div className="fp-data-table-wrap"><table className="fp-data-table fp-prediction-table"><thead><tr><th>Urut</th><th>Box / Barang</th><th>Posisi x, y, z</th><th>Lantai</th></tr></thead><tbody>{demo.placements.map(({ box, order, layer: boxLayer, position_cm }, index) => <tr key={box.box_id} className={selectedId === box.box_id ? 'fp-active-row' : ''}><td><button className="fp-order-button" onClick={() => setSelectedId(box.box_id)} aria-label={`Sorot ${box.box_id}`}>#{String(order).padStart(2, '0')}</button></td><td><strong className="fp-code" style={{ color: cargoColors[index] }}>{box.box_id}</strong><span className="fp-table-description">{box.name}</span><small>{box.dimensions.length_cm} × {box.dimensions.width_cm} × {box.dimensions.height_cm} cm</small></td><td className="whitespace-nowrap">{position_cm.x}, {position_cm.y}, {position_cm.z}<small>cm dari titik asal</small></td><td><span className="fp-rotation">{boxLayer} / Dasar</span></td></tr>)}</tbody></table></div>
          <div className="fp-demo-instructions"><Info className="h-5 w-5 shrink-0" /><div><strong>Catatan pemuatan contoh</strong><p>Semua box diletakkan di dasar tanpa tumpukan. Koordinat dan urutan sudah ditetapkan di frontend. Berat, kekuatan box, pusat gravitasi, dan beban gandar belum dianalisis.</p></div></div>
          <div className="fp-demo-result-footer"><span><CheckCircle2 className="h-4 w-4" />4 box contoh ditampilkan</span><Button variant="secondary" size="sm" onClick={() => downloadJson(demo, 'bin-studio-demo.json')}><Download className="h-4 w-4" />Ekspor Hasil Demo</Button></div>
        </>}
      </Panel>
    </div>
    <Dialog open={expanded} onOpenChange={setExpanded}><DialogContent className="max-w-4xl"><DialogHeader><DialogTitle>3D Bin Studio · Demo</DialogTitle><DialogDescription>Visualisasi contoh hardcoded. Bukan hasil algoritma optimasi.</DialogDescription></DialogHeader><CargoPreview dimensions={demo.container.dimensions} view={view} placements={placements} selectedId={selectedId} /></DialogContent></Dialog>
  </>;
}
