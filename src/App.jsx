import { useMemo, useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import FirmeModule from "./components/FirmeModule";
import ClientiModule from "./components/ClientiModule";
import ContracteModule from "./components/ContracteModule";
import DocumenteModule from "./components/DocumenteModule";

const MODULES = {
  dashboard: "dashboard",
  firme: "firme",
  clienti: "clienti",
  contracte: "contracte",
  documente: "documente"
};

function App() {
  const [activeModule, setActiveModule] = useState(MODULES.dashboard);

  const content = useMemo(() => {
    switch (activeModule) {
      case MODULES.firme:
        return <FirmeModule />;
      case MODULES.clienti:
        return <ClientiModule />;
      case MODULES.contracte:
        return <ContracteModule />;
      case MODULES.documente:
        return <DocumenteModule />;
      case MODULES.dashboard:
      default:
        return <Dashboard />;
    }
  }, [activeModule]);

  return (
    <Layout activeModule={activeModule} onChangeModule={setActiveModule}>
      {content}
    </Layout>
  );
}

export default App;
