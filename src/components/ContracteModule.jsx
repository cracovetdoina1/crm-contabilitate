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
  clientId: "",
  firmaContabilitateId: "",
  tipContract: "contabilitate",
  numarContract: "",
  dataContract: "",
  tarif: "",
  statusContract: "activ",
  observatii: ""
};

function ContracteModule() {
  const [form, setForm] = useState(initialForm);
  const [contracte, setContracte] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [firme, setFirme] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qContracte = query(collection(db, "contracte"), orderBy("created_at", "desc"));
    const unsubContracte = onSnapshot(qContracte, (snapshot) => {
      setContracte(
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
      unsubContracte();
      unsubClienti();
      unsubFirme();
    };
  }, []);

  const clientMap = useMemo(() => {
    return clienti.reduce((acc, client) => {
      acc[client.id] = client.denumire;
      return acc;
    }, {});
  }, [clienti]);

  const firmaMap = useMemo(() => {
    return firme.reduce((acc, firma) => {
      acc[firma.id] = firma.denumire;
      return acc;
    }, {});
  }, [firme]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    const selectedClient = clienti.find((item) => item.id === clientId);

    setForm((prev) => ({
      ...prev,
      clientId,
      firmaContabilitateId: selectedClient?.firma_contabilitate_id || ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.clientId || !form.firmaContabilitateId || !form.numarContract) {
      alert("Completează clientul, firma de contabilitate și numărul contractului.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "contracte"), {
        client_id: form.clientId,
        firma_contabilitate_id: form.firmaContabilitateId,
        tip_contract: form.tipContract,
        numar_contract: form.numarContract,
        data_contract: form.dataContract || null,
        tarif: form.tarif ? Number(form.tarif) : 0,
        status_contract: form.statusContract,
        observatii: form.observatii,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      setForm(initialForm);
    } catch (error) {
      console.error(error);
      alert("A apărut o eroare la salvarea contractului.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Contracte</h2>
          <p>Fiecare contract este legat de un client și de o firmă de contabilitate.</p>
        </div>
      </div>

      <div className="two-column">
        <div className="card">
          <h3>Adaugă contract</h3>

          <form className="form-grid" onSubmit={handleSubmit}>
            <select name="clientId" value={form.clientId} onChange={handleClientChange}>
              <option value="">Alege clientul</option>
              {clienti.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.denumire}
                </option>
              ))}
            </select>

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

            <select name="tipContract" value={form.tipContract} onChange={handleChange}>
              <option value="contabilitate">Contract contabilitate</option>
              <option value="bilant">Contract bilanț</option>
              <option value="hr">Contract resurse umane</option>
            </select>

            <input
              name="numarContract"
              placeholder="Număr contract"
              value={form.numarContract}
              onChange={handleChange}
            />

            <input
              name="dataContract"
              type="date"
              value={form.dataContract}
              onChange={handleChange}
            />

            <input
              name="tarif"
              type="number"
              placeholder="Tarif"
              value={form.tarif}
              onChange={handleChange}
            />

            <select name="statusContract" value={form.statusContract} onChange={handleChange}>
              <option value="activ">Activ</option>
              <option value="draft">Draft</option>
              <option value="suspendat">Suspendat</option>
              <option value="reziliat">Reziliat</option>
            </select>

            <textarea
              name="observatii"
              placeholder="Observații"
              value={form.observatii}
              onChange={handleChange}
            />

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Se salvează..." : "Salvează contract"}
            </button>
          </form>
        </div>

        <div className="card">
          <h3>Lista contractelor</h3>

          <div className="list-stack">
            {contracte.length === 0 ? (
              <p className="empty-state">Nu există contracte introduse încă.</p>
            ) : (
              contracte.map((contract) => (
                <div key={contract.id} className="list-card">
                  <strong>{contract.numar_contract}</strong>
                  <span>Client: {clientMap[contract.client_id] || "-"}</span>
                  <span>Firmă contabilitate: {firmaMap[contract.firma_contabilitate_id] || "-"}</span>
                  <span>Tip: {contract.tip_contract || "-"}</span>
                  <span>Tarif: {contract.tarif || 0} RON</span>
                  <span>Status: {contract.status_contract || "-"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContracteModule;
