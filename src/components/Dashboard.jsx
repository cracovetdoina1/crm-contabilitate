import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function Dashboard() {
  const [stats, setStats] = useState({
    firme: 0,
    clienti: 0,
    contracte: 0,
    documente: 0
  });

  useEffect(() => {
    const unsubFirme = onSnapshot(collection(db, "firme_contabilitate"), (snap) => {
      setStats((prev) => ({ ...prev, firme: snap.size }));
    });

    const unsubClienti = onSnapshot(collection(db, "clienti"), (snap) => {
      setStats((prev) => ({ ...prev, clienti: snap.size }));
    });

    const unsubContracte = onSnapshot(collection(db, "contracte"), (snap) => {
      setStats((prev) => ({ ...prev, contracte: snap.size }));
    });

    const unsubDocumente = onSnapshot(collection(db, "documente"), (snap) => {
      setStats((prev) => ({ ...prev, documente: snap.size }));
    });

    return () => {
      unsubFirme();
      unsubClienti();
      unsubContracte();
      unsubDocumente();
    };
  }, []);

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Imagine rapidă asupra datelor introduse în CRM.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Firme contabilitate</span>
          <strong>{stats.firme}</strong>
        </div>
        <div className="stat-card">
          <span>Clienți</span>
          <strong>{stats.clienti}</strong>
        </div>
        <div className="stat-card">
          <span>Contracte</span>
          <strong>{stats.contracte}</strong>
        </div>
        <div className="stat-card">
          <span>Documente</span>
          <strong>{stats.documente}</strong>
        </div>
      </div>

      <div className="card">
        <h3>Ce poți face în această versiune</h3>
        <ul className="simple-list">
          <li>adaugi firmele voastre de contabilitate;</li>
          <li>adaugi clienții și îi legi de o firmă;</li>
          <li>salvezi contracte pentru clienți;</li>
          <li>încarci documente PDF, Word sau imagini în Firebase Storage.</li>
        </ul>
      </div>
    </section>
  );
}

export default Dashboard;
