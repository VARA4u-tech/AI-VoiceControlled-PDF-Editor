import Layout from "@/components/Layout";
import {
  History,
  Search,
  FileText,
  Calendar,
  Trash2,
  Mic,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ActivityLog {
  id: string;
  document_name: string;
  command_type: string;
  transcript: string;
  created_at: string;
  is_success: boolean;
}

interface UserDocument {
  id: string;
  file_hash: string;
  updated_at: string;
  content: string[];
  page_count: number;
}

const SessionHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"documents" | "activity">("documents");

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    if (view === "documents") {
      const { data, error } = await supabase
        .from("user_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) toast.error("Failed to fetch documents.");
      else setDocuments(data || []);
    } else {
      const { data, error } = await supabase
        .from("scribe_activity")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) toast.error("Failed to fetch logs.");
      else setLogs(data || []);
    }
    setLoading(false);
  }, [user, view]);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, fetchData]);

  const handleRestore = (doc: UserDocument) => {
    // Strip the "__timestamp" suffix that was added during insert to make the
    // key unique, so the user sees a clean filename after restoring.
    const displayName = doc.file_hash.replace(/__\d+$/, "");
    localStorage.setItem(
      "gilded-scribe-session",
      JSON.stringify({
        fileName: displayName,
        paragraphs: doc.content,
        pageCount: doc.page_count || 0,
      }),
    );
    toast.success("Document version restored. Redirecting to dashboard...");
    setTimeout(() => navigate("/"), 1000);
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    const { error } = await supabase
      .from("user_documents")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete document.");
    } else {
      setDocuments(documents.filter((d) => d.id !== id));
      toast.success("Document removed from history.");
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity log?")) return;

    const { error } = await supabase
      .from("scribe_activity")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete log.");
    } else {
      setLogs(logs.filter((l) => l.id !== id));
      toast.success("Log entry deleted.");
    }
  };

  const handleClearAll = async () => {
    if (!user) return;
    const table = view === "documents" ? "user_documents" : "scribe_activity";
    const message =
      view === "documents"
        ? "Are you sure you want to delete ALL documents? This cannot be undone."
        : "Are you sure you want to delete ALL activity logs? This cannot be undone.";

    if (!confirm(message)) return;

    const { error } = await supabase
      .from(table)
      .delete()
      .eq("user_id", user.id);

    if (error) {
      toast.error(
        `Failed to clear ${view === "documents" ? "documents" : "activity logs"}.`,
      );
    } else {
      if (view === "documents") setDocuments([]);
      else setLogs([]);
      toast.success(`${view === "documents" ? "Documents" : "Logs"} cleared.`);
    }
  };

  return (
    <Layout title="History" subtitle="Activity History" icon={History}>
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* View Toggle */}
          <div className="flex rounded-sm border border-primary/20 bg-primary/5 p-1">
            <button
              onClick={() => setView("documents")}
              className={`font-tech px-4 py-2 text-[10px] uppercase tracking-widest transition-all ${view === "documents" ? "bg-accent/20 text-accent" : "text-primary/40 hover:text-primary"}`}
            >
              Saved Documents
            </button>
            <button
              onClick={() => setView("activity")}
              className={`font-tech px-4 py-2 text-[10px] uppercase tracking-widest transition-all ${view === "activity" ? "bg-accent/20 text-accent" : "text-primary/40 hover:text-primary"}`}
            >
              Voice Logs
            </button>
          </div>

          {/* Right side: Search + Clear All */}
          <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row md:items-center">
            {/* Search Header */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-sm border border-primary/20 bg-primary/5 py-2 pl-10 pr-4 font-mono text-[11px] text-primary transition-colors placeholder:text-primary/20 focus:border-accent/40 focus:outline-none"
              />
            </div>

            {(view === "documents"
              ? documents.length > 0
              : logs.length > 0) && (
              <button
                onClick={handleClearAll}
                className="font-tech flex shrink-0 items-center justify-center gap-2 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-2 text-[10px] uppercase tracking-widest text-red-500 transition-all hover:bg-red-500/20"
                title={
                  view === "documents" ? "Delete All Documents" : "Delete All Logs"
                }
              >
                <Trash2 className="h-3 w-3" /> Delete All
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : view === "documents" ? (
            documents.length > 0 ? (
              documents
                .filter((d) => {
                  // Strip the timestamp suffix added during insert
                  const displayName = d.file_hash.replace(/__\d+$/, "");
                  return searchTerm
                    ? displayName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    : true;
                })
                .map((doc) => {
                  // Strip the "__timestamp" suffix for a clean display name
                  const displayName = doc.file_hash.replace(/__\d+$/, "");
                  return (
                    <div
                      key={doc.id}
                      className="group relative overflow-hidden rounded-sm border border-primary/10 bg-primary/5 p-5 transition-all duration-300 hover:border-accent/40"
                    >
                      <div className="absolute left-0 top-0 h-full w-1 bg-primary/20 transition-colors group-hover:bg-accent" />
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-4">
                          <FileText className="h-5 w-5 shrink-0 text-primary/60" />
                          <div className="min-w-0">
                            <h4 className="truncate font-heading text-sm uppercase text-primary">
                              {displayName}
                            </h4>
                            <div className="mt-0.5 flex flex-wrap gap-3 font-mono text-[10px] text-primary/40">
                              <span>
                                {new Date(doc.updated_at).toLocaleString()}
                              </span>
                              {doc.page_count > 0 && (
                                <span>{doc.page_count} pages</span>
                              )}
                              <span>{doc.content.length} segments</span>
                              <span>
                                {doc.content
                                  .join(" ")
                                  .trim()
                                  .split(/\s+/)
                                  .length.toLocaleString()}{" "}
                                words
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => handleRestore(doc)}
                            className="font-tech flex items-center gap-2 rounded-sm border border-accent/20 bg-accent/10 p-2 text-[10px] uppercase tracking-widest text-accent transition-all hover:bg-accent/20"
                          >
                            <RotateCcw className="h-3 w-3" /> Restore
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="flex items-center gap-2 rounded-sm border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-all hover:bg-red-500/20"
                            title="Delete Document"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="space-y-3 rounded-sm border border-dashed border-primary/10 py-20 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary/40">
                  // No documents saved //
                </p>
                {!user ? (
                  <p className="font-body text-xs italic text-primary/30">
                    Sign in to auto-save uploaded documents to your history.
                  </p>
                ) : (
                  <p className="font-body text-xs italic text-primary/30">
                    Upload a PDF or TXT — it will appear here automatically.
                  </p>
                )}
              </div>
            )
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className="group relative overflow-hidden rounded-sm border border-primary/10 bg-primary/5 p-4"
              >
                <div className="flex items-start gap-4">
                  <Mic className="mt-1 h-4 w-4 text-accent/60" />
                  <div className="flex-1">
                    <h4 className="font-tech text-[11px] uppercase tracking-widest text-primary">
                      {log.command_type}
                    </h4>
                    <p className="my-1 font-body text-xs italic text-foreground/70">
                      "{log.transcript}"
                    </p>
                    <span className="font-mono text-[9px] text-primary/30">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="flex shrink-0 items-center gap-2 rounded-sm border border-red-500/20 bg-red-500/10 p-2 text-red-400 opacity-0 transition-all transition-opacity hover:bg-red-500/20 group-hover:opacity-100"
                    title="Delete Log"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-sm border border-dashed border-primary/10 py-20 text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary/40">
                // Voice activity logs empty //
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SessionHistory;
