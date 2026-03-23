import { useEffect, useState } from "react";
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
  adresa: "",
  administrator: "",
  telefon: "",
  email: "",
  observatii: ""
};

function FirmeModule() {
  const [form, setForm] = useState(initialForm);
  const [firme, setFirme] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "firme_contabilitate"), orderBy("created_at", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setFirme(data);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.denumire || !form.cui) {
      alert("Completează cel puțin denumirea și CUI-ul.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "firme_contabilitate"), {
        denumire: form.denumire,
        cui: form.cui,
        nr_reg_com: form.nrRegCom,
        adresa: form.adresa,
        administrator: form.administrator,
        telefon: form.telefon,
        email: form.email,
        observatii: form.observatii,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      setForm(initialForm);
    } catch (error) {
      console.error(error);
      alert("A apărut o eroare la salvarea firmei.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Firme de contabilitate</h2>
          <p>Aici introduci cele 8 firme ale grupului.</p>
        </div>
      </div>

      <div className="two-column">
        <div className="card">
          <h3>Adaugă firmă</h3>

          <form className="form-grid" onSubmit={handleSubmit}>
            <input
              name="denumire"
              placeholder="Denumire firmă"
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
              name="administrator"
              placeholder="Administrator"
              value={form.administrator}
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
            <textarea
              name="adresa"
              placeholder="Adresă"
              value={form.adresa}
              onChange={handleChange}
            />
            <textarea
              name="observatii"
              placeholder="Observații"
              value={form.observatii}
              onChange={handleChange}
            />

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Se salvează..." : "Salvează firmă"}
            </button>
          </form>
        </div>

        <div className="card">
          <h3>Lista firmelor</h3>

          <div className="list-stack">
            {firme.length === 0 ? (
              <p className="empty-state">Nu există firme introduse încă.</p>
            ) : (
              firme.map((firma) => (
                <div key={firma.id} className="list-card">
                  <strong>{firma.denumire}</strong>
                  <span>CUI: {firma.cui || "-"}</span>
                  <span>Reg. Com.: {firma.nr_reg_com || "-"}</span>
                  <span>Administrator: {firma.administrator || "-"}</span>
                  <span>Telefon: {firma.telefon || "-"}</span>
                  <span>Email: {firma.email || "-"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FirmeModule;
