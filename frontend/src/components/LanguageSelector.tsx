import React from "react";
import { Globe } from "lucide-react";

export const SUPPORTED_LANGUAGES = [
  { code: "en-US", name: "English (US)" },
  { code: "te-IN", name: "తెలుగు (Telugu)" },
  { code: "hi-IN", name: "हिन्दी (Hindi)" },
  { code: "ta-IN", name: "தமிழ் (Tamil)" },
  { code: "kn-IN", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml-IN", name: "മലയാളം (Malayalam)" },
  { code: "mr-IN", name: "मराठी (Marathi)" },
  { code: "bn-IN", name: "বাংলা (Bengali)" },
  { code: "gu-IN", name: "ગુજરાતી (Gujarati)" },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="relative flex items-center gap-2 rounded-full border border-primary/20 bg-slate-900/50 px-3 py-1.5 shadow-[0_0_10px_rgba(191,149,63,0.1)] transition-colors hover:border-primary/40">
      <Globe className="h-3.5 w-3.5 text-primary/70" />
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="appearance-none bg-transparent font-mono text-[11px] text-primary outline-none [&>option]:bg-slate-900"
        style={{ paddingRight: "12px" }}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      {/* Custom arrow for select */}
      <div className="pointer-events-none absolute right-3 border-x-4 border-t-4 border-x-transparent border-t-primary/50" />
    </div>
  );
};

export default LanguageSelector;
