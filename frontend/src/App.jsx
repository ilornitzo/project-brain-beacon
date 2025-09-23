import StatusCard from "./components/StatusCard";
import STPViewer from "./components/STPViewer";
import PromptPackViewer from "./components/PromptPackViewer";

const BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5055";
console.log("[BRaiN] VITE_API_BASE =", BASE);

function App() {
  return (
    <div style={{background:"#111", minHeight:"100vh", color:"#eee", fontFamily:"sans-serif", padding:"20px"}}>
      <h1 style={{fontSize:"28px", marginBottom:"20px"}}>Project Brain Beacon UI <span style={{fontSize:'14px', opacity:0.7}}>(deployed)</span></h1>
      <StatusCard />
      <STPViewer />
      <PromptPackViewer />
    </div>
  );
}

export default App;
