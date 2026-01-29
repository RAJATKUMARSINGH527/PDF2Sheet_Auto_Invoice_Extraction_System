import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Database, Shield, Save, Check, ExternalLink, 
  ArrowLeft, Loader2 
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  // Initialize from LocalStorage for immediate UI response
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const [sheetId, setSheetId] = useState(localStorage.getItem("spreadsheet_id") || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // Ref to track if we've already synced with the DB to prevent overwriting user input
  const hasFetched = useRef(false);

  // Load fresh settings from DB on mount
useEffect(() => {
  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/auth/profile", {
        headers: { "x-auth-token": token }
      });
      
      if (res.data) {
        // Update the React state
        setUser(res.data);
        setSheetId(res.data.spreadsheetId || "");
        
        // --- FORCE UPDATE LOCAL STORAGE ---
        localStorage.setItem("user", JSON.stringify(res.data));
        localStorage.setItem("spreadsheet_id", res.data.spreadsheetId || "");
        
        hasFetched.current = true;
      }
    } catch (error) {
      console.error(error.message, "Profile fetch failed");
      
    }
  };
  fetchSettings();
}, []);

const handleSave = async () => {
  setIsSaving(true);
  try {
    const token = localStorage.getItem("token");
    const payload = { spreadsheetId: sheetId, name: user.name };

    const res = await axios.post("https://pdf2sheet-auto-invoice-extraction-system.onrender.com/auth/update-settings", payload, {
      headers: { "x-auth-token": token }
    });

    if (res.data.success) {
      // 1. Update the full user object
      const updatedUser = { ...user, name: res.data.name, spreadsheetId: res.data.spreadsheetId };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // 2. Update the specific key the dashboard looks for
      localStorage.setItem("spreadsheet_id", res.data.spreadsheetId);
      
      // 3. Update local state
      setUser(updatedUser);
      setSheetId(res.data.spreadsheetId);

      window.dispatchEvent(new Event("storage"));
      setMessage({ type: "success", text: "Configuration Saved!" });
    }
  }catch (error) {
      console.error("Save Settings Error:", error);
      setMessage({ type: "error", text: "Save failed." });
    } finally {
    setIsSaving(false);
  }
};

  const openSheet = () => {
    if (sheetId) {
      window.open(`https://docs.google.com/spreadsheets/d/${sheetId}`, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Header with Back Option */}
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="p-2 hover:bg-slate-100 rounded-full transition-all"
          >
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Settings</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Configure Workspace Automation</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-8">
        
        {/* Toast Notification */}
        {message.text && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"
          }`}>
            {message.type === "success" ? <Check size={18} /> : <Shield size={18} />}
            <span className="text-sm font-bold">{message.text}</span>
          </div>
        )}

        {/* Profile Card */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100 text-center uppercase">
              {user.name?.charAt(0) || "U"}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">{user.name || "User Account"}</h3>
              <p className="text-slate-500 font-medium">{user.email}</p>
              <span className="mt-2 inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-full tracking-wider">MERN Pro Account</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" 
                value={user.name || ""} 
                onChange={(e) => {
                  hasFetched.current = true; // Block incoming DB sync from overwriting this
                  setUser({ ...user, name: e.target.value });
                }} 
                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered Email</label>
              <input 
                type="email" 
                value={user.email || ""} 
                disabled 
                className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold text-slate-400 cursor-not-allowed" 
              />
            </div>
          </div>
        </section>

        {/* Google Sheets Integration Card */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Database className="text-indigo-600" size={24} />
              <h3 className="text-xl font-black text-slate-800">Automation Sync</h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest">API Online</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Google Spreadsheet ID</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Paste ID here (e.g. 10T4N6Cccojulc7ObMdspdjGLzaA6RoQZzJCdiefNOT4)"
                  value={sheetId}
                  onChange={(e) => {
                    hasFetched.current = true;
                    setSheetId(e.target.value);
                  }}
                  className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                />
                <button 
                  onClick={openSheet}
                  title="Open Spreadsheet"
                  className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                >
                  <ExternalLink size={20} />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-3 italic leading-relaxed">
                The ID is the long string of characters in your Google Sheet URL: 
                <br />docs.google.com/spreadsheets/d/<span className="text-indigo-600 font-bold underline">THIS_PART_HERE</span>/edit
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
               <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-700 uppercase">Auto-Sync Status</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pushes extracted data to Row 1 of your sheet</span>
               </div>
               <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:bg-slate-300 disabled:shadow-none"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        </section>

        {/* Security / Info */}
        <section className="bg-slate-100/50 rounded-[2.5rem] p-8 border border-slate-200 border-dashed">
           <div className="flex items-start gap-4">
              <Shield className="text-slate-400 mt-1" size={20} />
              <div>
                 <h4 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Security Protocol</h4>
                 <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Your Spreadsheet ID is stored securely. We only access the specific sheet you provide. 
                    Ensure your Google Cloud credentials have "Editor" access to this sheet.
                 </p>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}