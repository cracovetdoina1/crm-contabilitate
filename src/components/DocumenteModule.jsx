import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase";

const initialForm = {
  entitateTip: "client",
  entitateId: "",
  categorieDocument: "contract",
  numeDocument: "",
  observatii: ""
};

function DocumenteModule() {
  const [form, setForm] = useState(initialForm);
  const [firme, setFirme] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [documente, setDocumente] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qFirme = query(collection(db, "firme_contabilitate"), orderBy("denumire", "asc"));
    const unsubFirme = onSnapshot(qFirme, (snapshot) => {
      setFirme(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    const qClienti = query(collection(db, "clienti"), orderBy("denumire", "asc"));
    const unsubClienti = onSnapshot(qClienti, (snapshot) => {
      setClienti(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    const qDocumente = query(collection(db, "documente"), orderBy("created_at", "desc"));
    const unsubDocumente = onSnapshot(qDocumente, (snapshot) => {
      setDocumente(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => {
      unsubFirme();
      unsubClienti();
      unsubDocumente();
    };
  }, []);

  const entityOptions = useMemo(() => {
    return form.entitateTip === "client" ? clienti : firme;
  }, [form.entitateTip, clienti, firme]);

  const clientMap = useMemo(() => {
    return clienti.reduce((acc, item) => {
      acc[item.id] = item.denumire;
      return acc;
    }, {});
  }, [clienti]);

  const firmaMap = useMemo(() => {
    return firme.reduce((acc, item) => {
      acc[item.id] = item.denumire;
      return acc;
    }, {});
  }, [firme]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "entitateTip" ? { entitateId: "" } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.entitateId || !form.numeDocument || !file) {
      alert("Alege entitatea, numele documentului și fișierul.");
      return;
    }

    try {
      setLoading(true);

      const folder = form.entitateTip === "client" ? "clienti" : "firme_contabilitate";
      const filePath = `${folder}/${form.entitateId}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, filePath);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, "documente"), {
        entitate_tip: form.entitateTip,
        entitate_id: form.entitateId,
        categorie_document: form.categorieDocument,
        nume_document: form.numeDocument,
        nume_fisier_original: file.name,
        tip_fisier: file.type || "necunoscut",
        url_fisier: downloadURL,
        storage_path: filePath,
        observatii: form.observatii,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      setForm(initialForm);
      setFile(null);

      const fileInput = document.getElementById("document-file-input");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error(error);
      alert("A apărut o eroare la încărcarea documentului.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Documente</h2>
          <p>Încarcă PDF, Word sau imagini și le leagă de firmă sau client.</p>
        </div>
      </div>

      <div className="two-column">
        <div className="card">
          <h3>Încarcă document</h3>

          <form className="form-grid" onSubmit={handleSubmit}>
            <select name="entitateTip" value={form.entitateTip} onChange={handleChange}>
              <option value="client">Client</option>
              <option value="firma_contabilitate">Firmă de contabilitate</option>
            </select>

            <select name="entitateId" value={form.entitateId} onChange={handleChange}>
              <option value="">Alege entitatea</option>
              {entityOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.denumire}
                </option>
              ))}
            </select>

            <select
              name="categorieDocument"
              value={form.categorieDocument}
              onChange={handleChange}
            >
              <option value="contract">Contract</option>
              <option value="act_constitutiv">Act constitutiv</option>
              <option value="certificat_inregistrare">Certificat înregistrare</option>
              <option value="procura">Procură</option>
              <option value="ci_administrator">CI administrator</option>
              <option value="alt_document">Alt document</option>
            </select>

            <input
              name="numeDocument"
              placeholder="Nume document"
              value={form.numeDocument}
              onChange={handleChange}
            />

            <input
              id="document-file-input"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <textarea
              name="observatii"
              placeholder="Observații"
              value={form.observatii}
              onChange={handleChange}
            />

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Se încarcă..." : "Încarcă document"}
            </button>
          </form>
        </div>

        <div className="card">
          <h3>Lista documentelor</h3>

          <div className="list-stack">
            {documente.length === 0 ? (
              <p className="empty-state">Nu există documente încărcate încă.</p>
            ) : (
              documente.map((doc) => (
                <div key={doc.id} className="list-card">
                  <strong>{doc.nume_document}</strong>
                  <span>
                    Entitate:{" "}
                    {doc.entitate_tip === "client"
                      ? clientMap[doc.entitate_id] || "-"
                      : firmaMap[doc.entitate_id] || "-"}
                  </span>
                  <span>Categorie: {doc.categorie_document || "-"}</span>
                  <span>Fișier: {doc.nume_fisier_original || "-"}</span>
                  <a href={doc.url_fisier} target="_blank" rel="noreferrer">
                    Deschide documentul
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DocumenteModule;
