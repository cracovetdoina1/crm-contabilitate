import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

const initialForm = {
  denumire: "",
  cui: "",
  nrRegCom: "",
  persoanaContact: "",
  telefon: "",
  email: "",
  firmaContabilitateId: "",
  platitorTva: "nu",
  vectorFiscal: "nu",
  punctLucru: "nu",
  cuiIntracomunitar: "nu",
  procura: "nu",
  token: "",
  suspendata: "nu",
  observatii: ""
};

function ClientiModule() {
  const [form, setForm] = useState(initialForm);
  const [clienti, setClienti] = useState([]);
  const [firme, setFirme] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const qClienti = query(collection(db, "clienti"), orderBy("created_at", "desc"));
    const unsubClienti = onSnapshot(qClienti, (snapshot) => {
      setClienti(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    const qFirme = query(collection(db, "firme_contabilitate"), orderBy("denumire", "asc"));
    const unsubFirme = onSnapshot(qFirme, (snapshot) => {
      setFirme(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => {
      unsubClienti();
      unsubFirme();
    };
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.denumire || !form.cui || !form.firmaContabilitateId) {
      alert("Completează denumirea, CUI-ul și firma de contabilitate.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "clienti"), {
        denumire: form.denumire,
        cui: form.cui,
        nr_reg_com: form.nrRegCom,
        persoana_contact: form.persoanaContact,
        telefon: form.telefon,
        email: form.email,
        firma_contabilitate_id: form.firmaContabilitateId,
        platitor_tva: form.platitorTva === "da",
        vector_fiscal: form.vectorFiscal === "da",
        punct_lucru: form.punctLucru === "da",
        cui_intracomunitar: form.cuiIntracomunitar === "da",
        procura: form.procura === "da",
        token: form.token,
        suspendata: form.suspendata === "da",
        status_client: form.suspendata === "da" ? "suspendat" : "activ",
        observatii: form.observatii,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      setForm(initialForm);
    } catch (error) {
      console.error(error);
      alert("A apărut o eroare la salvarea clientului.");
    } finally {
      setLoading(false);
    }
  };

  const firmaMap = useMemo(() => {
    return firme.reduce((acc, firma) => {
      acc[firma.id] = firma.denumire;
      return acc;
    }, {});
  }, [firme]);

  const filteredClienti = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return clienti;

    return clienti.filter((client) => {
      return (
        client.denumire?.toLowerCase().includes(term) ||
        client.cui?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term)
      );
    });
  }, [clienti, search]);

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Clienți</h2>
          <p>Clienții sunt legați direct de una dintre firmele voastre de contabilitate.</p>
        </div>
      </div>

      <div className="two-column">
        <div className="card">
          <h3>Adaugă client</h3>

          <form className="form-grid" onSubmit={handleSubmit}>
            <input
              name="denumire"
              placeholder="Denumire client"
              value={form.denumire}
              onChange={handleChange}
            />
            <input
              name="cui"
              placeholder="CUI"
              value={form.cui}
              onChange={handleChange}
            />
            <input
              name="nrRegCom"
              placeholder="Nr. Registrul Comerțului"
              value={form.nrRegCom}
              onChange={handleChange}
            />
            <input
              name="persoanaContact"
              placeholder="Persoană de contact"
              value={form.persoanaContact}
              onChange={handleChange}
            />
            <input
              name="telefon"
              placeholder="Telefon"
              value={form.telefon}
              onChange={handleChange}
            />
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <select
              name="firmaContabilitateId"
              value={form.firmaContabilitateId}
              onChange={handleChange}
            >
              <option value="">Alege firma de contabilitate</option>
              {firme.map((firma) => (
                <option key={firma.id} value={firma.id}>
                  {firma.denumire}
                </option>
              ))}
            </select>

            <select name="platitorTva" value={form.platitorTva} onChange={handleChange}>
              <option value="nu">Neplătitor TVA</option>
              <option value="da">Plătitor TVA</option>
            </select>

            <select name="vectorFiscal" value={form.vectorFiscal} onChange={handleChange}>
              <option value="nu">Fără vector fiscal</option>
              <option value="da">Are vector fiscal</option>
            </select>

            <select name="punctLucru" value={form.punctLucru} onChange={handleChange}>
              <option value="nu">Fără punct de lucru</option>
              <option value="da">Are punct de lucru</option>
            </select>

            <select
              name="cuiIntracomunitar"
              value={form.cuiIntracomunitar}
              onChange={handleChange}
            >
              <option value="nu">Fără CUI intracomunitar</option>
              <option value="da">Are CUI intracomunitar</option>
            </select>

            <select name="procura" value={form.procura} onChange={handleChange}>
              <option value="nu">Fără procură</option>
              <option value="da">Are procură</option>
            </select>

            <select name="suspendata" value={form.suspendata} onChange={handleChange}>
              <option value="nu">Firmă activă</option>
              <option value="da">Firmă suspendată</option>
            </select>

            <input
              name="token"
              placeholder="Token / semnătură"
              value={form.token}
              onChange={handleChange}
            />

            <textarea
              name="observatii"
              placeholder="Observații"
              value={form.observatii}
              onChange={handleChange}
            />

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Se salvează..." : "Salvează client"}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header-inline">
            <h3>Lista clienților</h3>
            <input
              className="search-input"
              placeholder="Caută după nume, CUI sau email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="list-stack">
            {filteredClienti.length === 0 ? (
              <p className="empty-state">Nu există clienți introduși încă.</p>
            ) : (
              filteredClienti.map((client) => (
                <div key={client.id} className="list-card">
                  <strong>{client.denumire}</strong>
                  <span>CUI: {client.cui || "-"}</span>
                  <span>Firmă contabilitate: {firmaMap[client.firma_contabilitate_id] || "-"}</span>
                  <span>Persoană contact: {client.persoana_contact || "-"}</span>
                  <span>Telefon: {client.telefon || "-"}</span>
                  <span>Email: {client.email || "-"}</span>
                  <span>Status: {client.status_client || "-"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClientiModule;
