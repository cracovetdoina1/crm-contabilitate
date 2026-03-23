import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVa3rvb_tX5gTofoTkIxkY3v-_JvfxRt4",
  authDomain: "sep-crm-contabilitate.firebaseapp.com",
  projectId: "sep-crm-contabilitate",
  storageBucket: "sep-crm-contabilitate.firebasestorage.app",
  messagingSenderId: "60818166086",
  appId: "1:60818166086:web:8784a9cee7fba5b9c85547",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const getCol = async (nume) => {
  const snap = await getDocs(collection(db, nume));
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
};
const addItem = (col, data) => addDoc(collection(db, col), data);
const updateItem = (col, id, data) => updateDoc(doc(db, col, id), data);
const deleteItem = (col, id) => deleteDoc(doc(db, col, id));

const Badge = ({ text, color }) => {
  const colors = { green: "bg-green-100 text-green-800", red: "bg-red-100 text-red-800", yellow: "bg-yellow-100 text-yellow-800", blue: "bg-blue-100 text-blue-800", gray: "bg-gray-100 text-gray-700", orange: "bg-orange-100 text-orange-800" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[color] || colors.gray}`}>{text}</span>;
};
const statusColor = (s) => ({ Activ: "green", Inactiv: "gray", Expirat: "red", "In asteptare": "yellow", "In lucru": "blue", Finalizat: "green" }[s] || "gray");
const prioritateColor = (p) => ({ Ridicata: "red", Medie: "orange", Scazuta: "blue" }[p] || "gray");

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
function Input({ label, ...props }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" {...props} />
    </div>
  );
}
function Select({ label, options, ...props }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
function Textarea({ label, ...props }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" rows={3} {...props} />
    </div>
  );
}
function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
      <p className="text-sm">Se încarcă datele din Firebase...</p>
    </div>
  );
}

function Dashboard({ clienti, contracte, scadente, comunicari }) {
  const azi = new Date();
  const in30Zile = new Date(azi); in30Zile.setDate(azi.getDate() + 30);
  const scadenteUrgente = scadente.filter(s => new Date(s.dataScadenta) <= in30Zile && s.status !== "Finalizat");
  const StatCard = ({ icon, label, value, color, sub }) => (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard icon="👥" label="Clienți Activi" value={clienti.filter(c => c.status === "Activ").length} color="border-indigo-500" sub={`din ${clienti.length} total`} />
        <StatCard icon="📄" label="Contracte Active" value={contracte.filter(c => c.status === "Activ").length} color="border-green-500" sub={`din ${contracte.length} total`} />
        <StatCard icon="⚠️" label="Scadențe în 30 zile" value={scadenteUrgente.length} color="border-orange-500" sub="necesită atenție" />
        <StatCard icon="💬" label="Comunicări" value={comunicari.length} color="border-blue-500" sub="în total" />
      </div>
      <h2 className="text-lg font-bold text-gray-700 mb-3">⏰ Scadențe Urgente</h2>
      {scadenteUrgente.length === 0
        ? <div className="bg-green-50 rounded-xl p-4 text-green-700 text-sm">✅ Nu ai scadențe urgente în următoarele 30 de zile!</div>
        : <div className="space-y-2">{scadenteUrgente.map(s => {
            const client = clienti.find(c => c.id === s.clientId);
            const zile = Math.ceil((new Date(s.dataScadenta) - azi) / 86400000);
            return (
              <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{s.titlu}</p>
                  <p className="text-xs text-gray-500">{client?.nume} • {s.dataScadenta}</p>
                </div>
                <div className="flex gap-2">
                  <Badge text={`${zile}z`} color={zile <= 7 ? "red" : "orange"} />
                  <Badge text={s.prioritate} color={prioritateColor(s.prioritate)} />
                </div>
              </div>
            );
          })}</div>
      }
    </div>
  );
}

function Clienti({ clienti, reload }) {
  const [search, setSearch] = useState("");
  const [filtruStatus, setFiltruStatus] = useState("Toti");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const filtered = clienti.filter(c => {
    const ms = c.nume?.toLowerCase().includes(search.toLowerCase()) || c.cui?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase());
    return ms && (filtruStatus === "Toti" || c.status === filtruStatus);
  });
  const save = async () => {
    if (!form.nume || !form.cui) return alert("Completează Denumire și CUI!");
    setSaving(true);
    try {
      if (modal === "add") { const { id, ...d } = form; await addItem("clienti", d); }
      else { const { id, ...d } = form; await updateItem("clienti", id, d); }
      await reload(); setModal(null);
    } catch (e) { alert("Eroare: " + e.message); }
    setSaving(false);
  };
  const sterge = async (id) => {
    if (!window.confirm("Ștergi clientul?")) return;
    await deleteItem("clienti", id); await reload();
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">👥 Clienți</h1>
        <button onClick={() => { setForm({ status: "Activ", tip: "SRL", dataInceput: new Date().toISOString().split("T")[0] }); setModal("add"); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700">+ Adaugă Client</button>
      </div>
      <div className="flex gap-3 mb-4 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Caută după nume, CUI, email..." className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        {["Toti", "Activ", "Inactiv"].map(s => <button key={s} onClick={() => setFiltruStatus(s)} className={`px-3 py-2 rounded-lg text-sm font-medium ${filtruStatus === s ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border"}`}>{s}</button>)}
      </div>
      <div className="space-y-2">
        {filtered.map(c => (
          <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-800">{c.nume}</p>
                <Badge text={c.tip} color="blue" /><Badge text={c.status} color={statusColor(c.status)} />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">CUI: {c.cui} • {c.email} • {c.telefon}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setForm({ ...c }); setModal("edit"); }} className="text-indigo-600 text-sm">✏️</button>
              <button onClick={() => sterge(c.id)} className="text-red-500 text-sm">🗑️</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-gray-400 py-10">Nu s-au găsit clienți.</div>}
      </div>
      {modal && (
        <Modal title={modal === "add" ? "Adaugă Client Nou" : "Editează Client"} onClose={() => setModal(null)}>
          <Input label="Denumire firmă / Nume *" value={form.nume || ""} onChange={e => setForm(p => ({ ...p, nume: e.target.value }))} />
          <Input label="CUI / CNP *" value={form.cui || ""} onChange={e => setForm(p => ({ ...p, cui: e.target.value }))} />
          <Input label="Persoană de contact" value={form.persoanaContact || ""} onChange={e => setForm(p => ({ ...p, persoanaContact: e.target.value }))} />
          <Input label="Email" type="email" value={form.email || ""} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <Input label="Telefon" value={form.telefon || ""} onChange={e => setForm(p => ({ ...p, telefon: e.target.value }))} />
          <Select label="Tip entitate" value={form.tip || "SRL"} onChange={e => setForm(p => ({ ...p, tip: e.target.value }))} options={[{ value: "SRL", label: "SRL" }, { value: "SA", label: "SA" }, { value: "PFA", label: "PFA" }, { value: "II", label: "Întreprindere Individuală" }, { value: "ONG", label: "ONG" }]} />
          <Select label="Status" value={form.status || "Activ"} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} options={[{ value: "Activ", label: "Activ" }, { value: "Inactiv", label: "Inactiv" }]} />
          <Input label="Dată început colaborare" type="date" value={form.dataInceput || ""} onChange={e => setForm(p => ({ ...p, dataInceput: e.target.value }))} />
          <Textarea label="Observații" value={form.observatii || ""} onChange={e => setForm(p => ({ ...p, observatii: e.target.value }))} />
          <button onClick={save} disabled={saving} className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 mt-2 disabled:opacity-50">{saving ? "Se salvează..." : "💾 Salvează în Firebase"}</button>
        </Modal>
      )}
    </div>
  );
}

function Contracte({ contracte, clienti, reload }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!form.numar || !form.clientId) return alert("Completează număr contract și client!");
    setSaving(true);
    try {
      if (modal === "add") { const { id, ...d } = form; await addItem("contracte", d); }
      else { const { id, ...d } = form; await updateItem("contracte", id, d); }
      await reload(); setModal(null);
    } catch (e) { alert("Eroare: " + e.message); }
    setSaving(false);
  };
  const sterge = async (id) => { if (!window.confirm("Ștergi contractul?")) return; await deleteItem("contracte", id); await reload(); };
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">📄 Contracte</h1>
        <button onClick={() => { setForm({ status: "Activ", moneda: "RON", clientId: clienti[0]?.id }); setModal("add"); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700">+ Adaugă Contract</button>
      </div>
      <div className="space-y-2">
        {contracte.map(c => {
          const client = clienti.find(cl => cl.id === c.clientId);
          const zile = Math.ceil((new Date(c.dataExpirare) - new Date()) / 86400000);
          return (
            <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800">{c.numar}</p>
                    <Badge text={c.status} color={statusColor(c.status)} />
                    {zile <= 30 && c.status === "Activ" && <Badge text={`Expiră în ${zile}z`} color="orange" />}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">🏢 {client?.nume || "Client necunoscut"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.servicii}</p>
                  <p className="text-xs text-gray-400 mt-0.5">📅 {c.dataStart} → {c.dataExpirare} • 💰 {c.valoare} {c.moneda}/lună</p>
                </div>
                <div className="flex gap-2 ml-2">
                  <button onClick={() => { setForm({ ...c }); setModal("edit"); }} className="text-indigo-600 text-sm">✏️</button>
                  <button onClick={() => sterge(c.id)} className="text-red-500 text-sm">🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
        {contracte.length === 0 && <div className="text-center text-gray-400 py-10">Nu există contracte încă.</div>}
      </div>
      {modal && (
        <Modal title={modal === "add" ? "Adaugă Contract" : "Editează Contract"} onClose={() => setModal(null)}>
          <Select label="Client *" value={form.clientId || ""} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))} options={clienti.map(c => ({ value: c.id, label: c.nume }))} />
          <Input label="Număr contract *" value={form.numar || ""} onChange={e => setForm(p => ({ ...p, numar: e.target.value }))} placeholder="CTR-001/2025" />
          <Textarea label="Servicii incluse" value={form.servicii || ""} onChange={e => setForm(p => ({ ...p, servicii: e.target.value }))} />
          <Input label="Valoare lunară" type="number" value={form.valoare || ""} onChange={e => setForm(p => ({ ...p, valoare: e.target.value }))} />
          <Select label="Monedă" value={form.moneda || "RON"} onChange={e => setForm(p => ({ ...p, moneda: e.target.value }))} options={[{ value: "RON", label: "RON" }, { value: "EUR", label: "EUR" }]} />
          <Input label="Dată start" type="date" value={form.dataStart || ""} onChange={e => setForm(p => ({ ...p, dataStart: e.target.value }))} />
          <Input label="Dată expirare" type="date" value={form.dataExpirare || ""} onChange={e => setForm(p => ({ ...p, dataExpirare: e.target.value }))} />
          <Select label="Status" value={form.status || "Activ"} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} options={[{ value: "Activ", label: "Activ" }, { value: "Inactiv", label: "Inactiv" }, { value: "Expirat", label: "Expirat" }]} />
          <button onClick={save} disabled={saving} className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 mt-2 disabled:opacity-50">{saving ? "Se salvează..." : "💾 Salvează în Firebase"}</button>
        </Modal>
      )}
    </div>
  );
}

function Scadente({ scadente, clienti, reload }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [filtru, setFiltru] = useState("Toate");
  const [saving, setSaving] = useState(false);
  const azi = new Date();
  const filtered = scadente.filter(s => filtru === "Toate" || s.status === filtru).sort((a, b) => new Date(a.dataScadenta) - new Date(b.dataScadenta));
  const marcheaza = async (id) => { await updateItem("scadente", id, { status: "Finalizat" }); await reload(); };
  const sterge = async (id) => { if (!window.confirm("Ștergi scadența?")) return; await deleteItem("scadente", id); await reload(); };
  const save = async () => {
    if (!form.titlu || !form.dataScadenta) return alert("Completează titlu și dată!");
    setSaving(true);
    try {
      if (modal === "add") { const { id, ...d } = form; await addItem("scadente", d); }
      else { const { id, ...d } = form; await updateItem("scadente", id, d); }
      await reload(); setModal(null);
    } catch (e) { alert("Eroare: " + e.message); }
    setSaving(false);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">📅 Scadențe Fiscale</h1>
        <button onClick={() => { setForm({ status: "In asteptare", prioritate: "Medie", tip: "Declaratie", clientId: clienti[0]?.id }); setModal("add"); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700">+ Adaugă</button>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {["Toate", "In asteptare", "In lucru", "Finalizat"].map(s => <button key={s} onClick={() => setFiltru(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filtru === s ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border"}`}>{s}</button>)}
      </div>
      <div className="space-y-2">
        {filtered.map(s => {
          const client = clienti.find(c => c.id === s.clientId);
          const zile = Math.ceil((new Date(s.dataScadenta) - azi) / 86400000);
          const depasit = zile < 0;
          return (
            <div key={s.id} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${depasit && s.status !== "Finalizat" ? "border-red-500" : s.status === "Finalizat" ? "border-green-500" : "border-orange-400"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800">{s.titlu}</p>
                    <Badge text={s.prioritate} color={prioritateColor(s.prioritate)} />
                    <Badge text={s.status} color={statusColor(s.status)} />
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">🏢 {client?.nume} • 📅 {s.dataScadenta}</p>
                  <p className="text-xs mt-0.5">
                    {s.status !== "Finalizat" && (depasit ? <span className="text-red-600 font-semibold">⛔ Depășit cu {Math.abs(zile)} zile!</span> : <span className={zile <= 7 ? "text-red-500 font-semibold" : "text-orange-500"}>⏰ {zile} zile rămase</span>)}
                    {s.status === "Finalizat" && <span className="text-green-600">✅ Finalizat</span>}
                  </p>
                </div>
                <div className="flex gap-2 ml-2">
                  {s.status !== "Finalizat" && <button onClick={() => marcheaza(s.id)} className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs">✅</button>}
                  <button onClick={() => { setForm({ ...s }); setModal("edit"); }} className="text-indigo-600 text-sm">✏️</button>
                  <button onClick={() => sterge(s.id)} className="text-red-500 text-sm">🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center text-gray-400 py-10">Nu există scadențe.</div>}
      </div>
      {modal && (
        <Modal title={modal === "add" ? "Adaugă Scadență" : "Editează Scadență"} onClose={() => setModal(null)}>
          <Select label="Client" value={form.clientId || ""} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))} options={clienti.map(c => ({ value: c.id, label: c.nume }))} />
          <Input label="Titlu *" value={form.titlu || ""} onChange={e => setForm(p => ({ ...p, titlu: e.target.value }))} placeholder="Declaratie 300 - TVA" />
          <Select label="Tip" value={form.tip || "Declaratie"} onChange={e => setForm(p => ({ ...p, tip: e.target.value }))} options={[{ value: "Declaratie", label: "Declarație" }, { value: "TVA", label: "TVA" }, { value: "Bilant", label: "Bilanț" }, { value: "Salarii", label: "Salarii" }, { value: "Altul", label: "Altul" }]} />
          <Input label="Dată scadentă *" type="date" value={form.dataScadenta || ""} onChange={e => setForm(p => ({ ...p, dataScadenta: e.target.value }))} />
          <Select label="Prioritate" value={form.prioritate || "Medie"} onChange={e => setForm(p => ({ ...p, prioritate: e.target.value }))} options={[{ value: "Ridicata", label: "Ridicată" }, { value: "Medie", label: "Medie" }, { value: "Scazuta", label: "Scăzută" }]} />
          <Select label="Status" value={form.status || "In asteptare"} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} options={[{ value: "In asteptare", label: "În așteptare" }, { value: "In lucru", label: "În lucru" }, { value: "Finalizat", label: "Finalizat" }]} />
          <button onClick={save} disabled={saving} className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 mt-2 disabled:opacity-50">{saving ? "Se salvează..." : "💾 Salvează în Firebase"}</button>
        </Modal>
      )}
    </div>
  );
}

function Comunicari({ comunicari, clienti, reload }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [filtruClient, setFiltruClient] = useState("Toti");
  const [saving, setSaving] = useState(false);
  const filtered = comunicari.filter(c => filtruClient === "Toti" || c.clientId === filtruClient).sort((a, b) => new Date(b.data) - new Date(a.data));
  const save = async () => {
    if (!form.subiect || !form.clientId) return alert("Completează subiectul și clientul!");
    setSaving(true);
    try {
      const { id, ...d } = { ...form, data: form.data || new Date().toISOString().split("T")[0] };
      await addItem("comunicari", d); await reload(); setModal(false);
    } catch (e) { alert("Eroare: " + e.message); }
    setSaving(false);
  };
  const sterge = async (id) => { if (!window.confirm("Ștergi comunicarea?")) return; await deleteItem("comunicari", id); await reload(); };
  const tipIcon = { Email: "📧", Telefon: "📞", Intalnire: "🤝", SMS: "💬" };
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">💬 Comunicări</h1>
        <button onClick={() => { setForm({ tip: "Email", data: new Date().toISOString().split("T")[0], clientId: clienti[0]?.id }); setModal(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700">+ Adaugă</button>
      </div>
      <div className="mb-4">
        <select value={filtruClient} onChange={e => setFiltruClient(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="Toti">Toți clienții</option>
          {clienti.map(c => <option key={c.id} value={c.id}>{c.nume}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        {filtered.map(c => {
          const client = clienti.find(cl => cl.id === c.clientId);
          return (
            <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm flex items-start justify-between">
              <div className="flex gap-3">
                <span className="text-2xl">{tipIcon[c.tip] || "💬"}</span>
                <div>
                  <div className="flex items-center gap-2"><p className="font-semibold text-gray-800 text-sm">{c.subiect}</p><Badge text={c.tip} color="blue" /></div>
                  <p className="text-xs text-gray-500 mt-0.5">🏢 {client?.nume} • 📅 {c.data} • 👤 {c.autor}</p>
                  {c.detalii && <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded-lg p-2">{c.detalii}</p>}
                </div>
              </div>
              <button onClick={() => sterge(c.id)} className="text-red-400 hover:text-red-600 text-sm ml-2">🗑️</button>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center text-gray-400 py-10">Nu există comunicări.</div>}
      </div>
      {modal && (
        <Modal title="Adaugă Comunicare" onClose={() => setModal(false)}>
          <Select label="Client *" value={form.clientId || ""} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))} options={clienti.map(c => ({ value: c.id, label: c.nume }))} />
          <Select label="Tip" value={form.tip || "Email"} onChange={e => setForm(p => ({ ...p, tip: e.target.value }))} options={[{ value: "Email", label: "📧 Email" }, { value: "Telefon", label: "📞 Telefon" }, { value: "Intalnire", label: "🤝 Întâlnire" }, { value: "SMS", label: "💬 SMS" }]} />
          <Input label="Subiect *" value={form.subiect || ""} onChange={e => setForm(p => ({ ...p, subiect: e.target.value }))} />
          <Textarea label="Detalii" value={form.detalii || ""} onChange={e => setForm(p => ({ ...p, detalii: e.target.value }))} />
          <Input label="Data" type="date" value={form.data || ""} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} />
          <Input label="Autor" value={form.autor || ""} onChange={e => setForm(p => ({ ...p, autor: e.target.value }))} />
          <button onClick={save} disabled={saving} className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 mt-2 disabled:opacity-50">{saving ? "Se salvează..." : "💾 Salvează în Firebase"}</button>
        </Modal>
      )}
    </div>
  );
}

export default function CRMApp() {
  const [pagina, setPagina] = useState("dashboard");
  const [clienti, setClienti] = useState([]);
  const [contracte, setContracte] = useState([]);
  const [scadente, setScadente] = useState([]);
  const [comunicari, setComunicari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare] = useState(null);
  const [menuDeschis, setMenuDeschis] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const [c, ct, s, cm] = await Promise.all([getCol("clienti"), getCol("contracte"), getCol("scadente"), getCol("comunicari")]);
      setClienti(c); setContracte(ct); setScadente(s); setComunicari(cm);
      setEroare(null);
    } catch (e) {
      setEroare("Nu s-a putut conecta la Firebase: " + e.message);
    }
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "clienti", label: "Clienți", icon: "👥" },
    { id: "contracte", label: "Contracte", icon: "📄" },
    { id: "scadente", label: "Scadențe", icon: "📅" },
    { id: "comunicari", label: "Comunicări", icon: "💬" },
  ];

  const renderPagina = () => {
    if (loading) return <Loading />;
    if (eroare) return <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700"><p className="font-bold mb-1">❌ Eroare de conectare</p><p className="text-sm">{eroare}</p><button onClick={reload} className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm">🔄 Încearcă din nou</button></div>;
    switch (pagina) {
      case "dashboard": return <Dashboard clienti={clienti} contracte={contracte} scadente={scadente} comunicari={comunicari} />;
      case "clienti": return <Clienti clienti={clienti} reload={reload} />;
      case "contracte": return <Contracte contracte={contracte} clienti={clienti} reload={reload} />;
      case "scadente": return <Scadente scadente={scadente} clienti={clienti} reload={reload} />;
      case "comunicari": return <Comunicari comunicari={comunicari} clienti={clienti} reload={reload} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-indigo-700 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-xl">🏛️</span>
          <div>
            <p className="font-bold text-sm leading-tight">SEP CRM Contabilitate</p>
            <p className="text-indigo-200 text-xs">{loading ? "Se conectează..." : eroare ? "❌ Eroare" : `${clienti.length} clienți • 🔥 Firebase activ`}</p>
          </div>
        </div>
        <button onClick={() => setMenuDeschis(!menuDeschis)} className="md:hidden text-white text-xl">☰</button>
      </header>
      <div className="flex flex-1">
        <nav className="hidden md:flex flex-col w-52 bg-white border-r shadow-sm p-3 gap-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPagina(item.id)} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pagina === item.id ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-indigo-50"}`}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
          <div className="mt-auto pt-4 border-t">
            <div className="px-3 py-2 bg-orange-50 rounded-xl">
              <p className="text-xs text-orange-700 font-semibold">🔥 Firebase activ</p>
              <p className="text-xs text-orange-600">sep-crm-contabilitate</p>
            </div>
          </div>
        </nav>
        {menuDeschis && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" onClick={() => setMenuDeschis(false)}>
            <div className="bg-white w-60 h-full p-4" onClick={e => e.stopPropagation()}>
              <p className="font-bold text-gray-700 mb-4 text-lg">🏛️ SEP CRM</p>
              {navItems.map(item => (
                <button key={item.id} onClick={() => { setPagina(item.id); setMenuDeschis(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium mb-1 ${pagina === item.id ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-indigo-50"}`}>
                  <span>{item.icon}</span>{item.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-3xl">
          {renderPagina()}
        </main>
      </div>
    </div>
  );
}
