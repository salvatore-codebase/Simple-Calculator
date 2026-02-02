import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, History, Calculator } from 'lucide-react';
import { useCalculations, useClearCalculations } from '@/hooks/use-calculations';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function HistorySidebar({ className }: { className?: string }) {
  const { data: calculations, isLoading } = useCalculations();
  const clearHistory = useClearCalculations();

  return (
    <div className={cn(
      "flex flex-col h-full bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-3xl border border-white/20 dark:border-white/10 shadow-xl overflow-hidden",
      className
    )}>
      <div className="p-6 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <History className="w-5 h-5" />
          </div>
          <h2 className="font-display font-bold text-xl">History</h2>
        </div>
        
        <button
          onClick={() => clearHistory.mutate()}
          disabled={!calculations?.length || clearHistory.isPending}
          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Clear History"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading history...</p>
          </div>
        ) : !calculations?.length ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <Calculator className="w-8 h-8" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-1">No calculations yet</h3>
            <p className="text-sm text-muted-foreground">
              Start calculating to see your history appear here.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {calculations.map((calc, index) => (
              <motion.div
                key={calc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-card hover:bg-accent/5 p-4 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono text-sm text-muted-foreground">
                    {calc.expression}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 font-medium">
                    {format(new Date(calc.createdAt || new Date()), 'HH:mm')}
                  </span>
                </div>
                <div className="font-mono text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  = {calc.result}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
