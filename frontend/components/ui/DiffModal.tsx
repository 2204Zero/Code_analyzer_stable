import { motion, AnimatePresence } from "framer-motion";
import { X, GitMerge } from "lucide-react";
import ReactDiffViewer from "react-diff-viewer-continued";
import { useVertexStore } from "@/store/useVertexStore";

export function DiffModal() {
  const { selectedPatch, setSelectedPatch } = useVertexStore();

  return (
    <AnimatePresence>
      {selectedPatch && (
        <motion.div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="w-full max-w-5xl bg-[#09090B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            initial={{ y: 50, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <GitMerge className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">AI Auto-Healer Patch</h3>
                <span className="bg-white/10 px-2 py-1 rounded text-xs font-mono text-zinc-400 border border-white/5">
                  {selectedPatch.filepath}
                </span>
              </div>
              <button 
                onClick={() => setSelectedPatch(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400 hover:text-white" />
              </button>
            </div>

            {/* Content: Issue Context */}
            <div className="p-6 bg-white/[0.02] border-b border-white/10 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">Detected Issue</h4>
              <p className="text-zinc-300 font-mono text-sm">{selectedPatch.issue}</p>
              
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mt-2">Suggested Fix</h4>
              <p className="text-zinc-300 font-mono text-sm">{selectedPatch.suggested_fix}</p>
            </div>

            {/* Content: Diff Viewer */}
            <div className="flex-1 overflow-auto bg-[#0d1117] p-4 text-sm font-mono custom-scrollbar">
              <ReactDiffViewer 
                oldValue={""} 
                newValue={selectedPatch.git_patch || "No patch generated."} 
                splitView={false} 
                useDarkTheme={true}
                hideLineNumbers={true}
                styles={{
                  variables: {
                    dark: {
                      diffViewerBackground: 'transparent',
                      diffViewerTitleBackground: 'transparent',
                      addedBackground: 'rgba(16, 185, 129, 0.15)',
                      addedColor: '#34d399',
                      removedBackground: 'rgba(225, 29, 72, 0.15)',
                      removedColor: '#fb7185',
                      wordAddedBackground: 'rgba(16, 185, 129, 0.3)',
                      wordRemovedBackground: 'rgba(225, 29, 72, 0.3)',
                      addedGutterBackground: 'rgba(16, 185, 129, 0.1)',
                      removedGutterBackground: 'rgba(225, 29, 72, 0.1)',
                      gutterBackground: 'transparent',
                      gutterBackgroundDark: 'transparent',
                      highlightBackground: 'rgba(255,255,255,0.05)',
                      highlightGutterBackground: 'transparent',
                      codeFoldGutterBackground: 'transparent',
                      codeFoldBackground: 'transparent',
                      emptyLineBackground: 'transparent',
                      gutterColor: '#71717a',
                      addedGutterColor: '#34d399',
                      removedGutterColor: '#fb7185',
                    }
                  }
                }}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedPatch(null)}
                className="px-4 py-2 rounded-md font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert("Applying fix to GitHub...");
                  setSelectedPatch(null);
                }}
                className="px-6 py-2 rounded-md font-bold text-black bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all hover:scale-105"
              >
                Apply Fix to GitHub
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
