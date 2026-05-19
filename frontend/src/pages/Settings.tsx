import Layout from "@/components/Layout";
import {
  Settings,
  Volume2,
  Mic,
  Palette,
  Bell,
  Save,
  Globe,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const SystemSettings = () => {
  const { playClick, playSuccess } = useSoundEffects();
  const [volume, setVolume] = useState(65);
  const [ambience, setAmbience] = useState(40);
  const [language, setLanguage] = useState("en-US");
  const [options, setOptions] = useState([
    {
      id: "sensitivity",
      label: "High Sensitivity Mode",
      value: true,
      desc: "Increase detection range for whispered commands.",
    },
    {
      id: "synthesis",
      label: "Continuous Synthesis",
      value: false,
      desc: "AI will attempt to summarize document changes in real-time.",
    },
    {
      id: "autoscroll",
      label: "Auto-Scroll on Focus",
      value: true,
      desc: "Automatically center the document on the paragraph being edited.",
    },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("scribe_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.volume !== undefined) setVolume(parsed.volume);
      if (parsed.ambience !== undefined) setAmbience(parsed.ambience);
      if (parsed.options) setOptions(parsed.options);
      if (parsed.language) setLanguage(parsed.language);
    }
  }, []);

  const toggleOption = (id: string) => {
    playClick();
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, value: !opt.value } : opt)),
    );
  };

  const handleSave = () => {
    playSuccess();
    localStorage.setItem(
      "scribe_settings",
      JSON.stringify({ volume, ambience, options, language }),
    );
    toast.success("Settings saved successfully.");
  };

  return (
    <Layout title="Settings" subtitle="User Preferences" icon={Settings}>
      <div className="space-y-10">
        <section className="space-y-6">
          <h3 className="font-tech flex items-center gap-2 border-b border-primary/10 pb-2 text-xs uppercase tracking-widest text-primary">
            <Volume2 className="h-4 w-4 text-accent" />
            Audio Settings
          </h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <label className="block font-mono text-[10px] uppercase text-primary/40">
                System Volume ({volume}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full bg-primary/10 accent-accent transition-all"
              />
            </div>
            <div className="space-y-4">
              <label className="block font-mono text-[10px] uppercase text-primary/40">
                Ambience Saturation ({ambience}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={ambience}
                onChange={(e) => setAmbience(parseInt(e.target.value))}
                className="w-full bg-primary/10 accent-primary"
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="font-tech flex items-center gap-2 border-b border-primary/10 pb-2 text-xs uppercase tracking-widest text-primary">
            <Globe className="h-4 w-4 text-accent" />
            Language Settings
          </h3>
          <div className="max-w-md space-y-4">
            <label className="block font-mono text-[10px] uppercase text-primary/40">
              Transcription Language
            </label>
            <select
              value={language}
              onChange={(e) => {
                playClick();
                setLanguage(e.target.value);
              }}
              className="font-tech w-full rounded-sm border border-primary/20 bg-primary/5 p-3 text-sm tracking-wider text-foreground focus:border-accent focus:outline-none"
            >
              <option className="bg-slate-900 text-foreground" value="en-US">
                English (US)
              </option>
              <option className="bg-slate-900 text-foreground" value="en-GB">
                English (UK)
              </option>
              <option className="bg-slate-900 text-foreground" value="hi-IN">
                Hindi (India)
              </option>
              <option className="bg-slate-900 text-foreground" value="te-IN">
                Telugu (India)
              </option>
              <option className="bg-slate-900 text-foreground" value="es-ES">
                Spanish (Spain)
              </option>
              <option className="bg-slate-900 text-foreground" value="fr-FR">
                French (France)
              </option>
              <option className="bg-slate-900 text-foreground" value="de-DE">
                German (Germany)
              </option>
            </select>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="font-tech flex items-center gap-2 border-b border-primary/10 pb-2 text-xs uppercase tracking-widest text-primary">
            <Mic className="h-4 w-4 text-accent" />
            Voice Settings
          </h3>
          <div className="space-y-4">
            {options.map((option) => (
              <div
                key={option.id}
                className="flex items-start justify-between gap-8 rounded-sm border border-primary/5 bg-primary/5 p-4"
              >
                <div>
                  <h4 className="font-tech mb-1 text-[10px] uppercase tracking-widest text-primary">
                    {option.label}
                  </h4>
                  <p className="font-body text-[13px] italic text-foreground/60">
                    {option.desc}
                  </p>
                </div>
                <button
                  onClick={() => toggleOption(option.id)}
                  className={`relative h-5 w-10 shrink-0 rounded-full transition-colors ${option.value ? "bg-accent/40" : "border border-primary/20 bg-primary/5"}`}
                >
                  <div
                    className={`absolute top-1 h-3 w-3 rounded-full transition-all ${option.value ? "right-1 bg-accent" : "left-1 bg-primary/40"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="font-tech flex items-center gap-2 border-b border-primary/10 pb-2 text-xs uppercase tracking-widest text-primary">
            <Palette className="h-4 w-4 text-accent" />
            Interface Themes
          </h3>
          <div className="flex gap-4">
            <div
              className="h-10 w-10 cursor-pointer rounded-sm border-2 border-accent bg-background"
              title="Emerald Theme"
            />
            <div
              className="h-10 w-10 cursor-pointer rounded-sm border border-primary/20 bg-slate-900"
              title="Obsidian Theme"
            />
            <div
              className="h-10 w-10 cursor-pointer rounded-sm border border-primary/20 bg-blue-950"
              title="Azure Theme"
            />
          </div>
        </section>

        <div className="flex justify-end pt-8">
          <button
            onClick={handleSave}
            className="font-tech group flex items-center gap-2 border border-accent/40 bg-accent/20 px-8 py-3 text-[11px] uppercase tracking-widest text-accent transition-all hover:bg-accent/30"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default SystemSettings;
