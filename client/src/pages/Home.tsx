import { useState, useEffect, useCallback } from "react";
import { evaluate } from "mathjs";
import { HistorySidebar } from "@/components/HistorySidebar";
import { CalculatorButton } from "@/components/CalculatorButton";
import { useCreateCalculation } from "@/hooks/use-calculations";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, Divide, Minus, Plus, X, Equal, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const THEME_KEY = "calculator-theme-preference";

export default function Home() {
  const [display, setDisplay] = useState("");
  const [result, setResult] = useState("");
  const [lastWasResult, setLastWasResult] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const createCalculation = useCreateCalculation();
  const { toast } = useToast();

  // Theme handling
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleInput = useCallback((value: string) => {
    if (lastWasResult) {
      if (['+', '-', '*', '/'].includes(value)) {
        // Continue calculating with previous result
        setDisplay(result + value);
        setLastWasResult(false);
      } else {
        // Start new calculation
        setDisplay(value);
        setResult("");
        setLastWasResult(false);
      }
    } else {
      setDisplay((prev) => prev + value);
    }
  }, [lastWasResult, result]);

  const handleClear = useCallback(() => {
    setDisplay("");
    setResult("");
    setLastWasResult(false);
  }, []);

  const handleDelete = useCallback(() => {
    if (lastWasResult) {
      handleClear();
    } else {
      setDisplay((prev) => prev.slice(0, -1));
    }
  }, [lastWasResult, handleClear]);

  const handleCalculate = useCallback(async () => {
    if (!display) return;
    
    try {
      // Replace visual operators with math operators
      const expression = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
        
      const calculatedResult = String(evaluate(expression));
      
      setResult(calculatedResult);
      setDisplay(calculatedResult); // Show result in main display
      setLastWasResult(true);

      // Save to backend
      createCalculation.mutate({
        expression: display,
        result: calculatedResult
      });

    } catch (error) {
      toast({
        title: "Invalid Expression",
        description: "Please check your calculation syntax.",
        variant: "destructive",
      });
    }
  }, [display, createCalculation, toast]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      if (/[0-9.]/.test(key)) {
        handleInput(key);
      } else if (['+', '-', '*', '/'].includes(key)) {
        // Map keyboard operators to visual ones if needed, or pass directly
        const opMap: Record<string, string> = { '*': '×', '/': '÷' };
        handleInput(opMap[key] || key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (key === 'Backspace') {
        handleDelete();
      } else if (key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleCalculate, handleDelete, handleClear]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 p-4 md:p-8 lg:p-12 flex items-center justify-center font-body transition-colors duration-500">
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 h-[76vh] lg:h-[720px]">
        
        {/* Calculator Main Panel */}
        <div className="lg:col-span-7 h-full flex flex-col justify-center">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-purple-400">
                Calculator
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Simple & Powerful</p>
            </div>
            
            <button 
              onClick={toggleTheme}
              className="p-3 rounded-full bg-white dark:bg-zinc-800 shadow-lg shadow-black/5 hover:scale-110 transition-transform active:scale-95 border border-border"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-indigo-600" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
            </button>
          </div>

          {/* Calculator Body */}
          <div className="bg-white dark:bg-zinc-950 rounded-[1.5rem] shadow-2xl shadow-indigo-500/10 dark:shadow-black/50 border border-white/50 dark:border-white/5 p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden backdrop-blur-sm">
            
            {/* Display Area */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-5 md:p-6 text-right mb-1 border border-zinc-100 dark:border-white/5 shadow-inner min-h-[120px] flex flex-col justify-end transition-colors">
              <AnimatePresence mode="wait">
                {lastWasResult && display !== "" && (
                   <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0 }}
                     className="text-muted-foreground text-sm font-mono mb-1"
                   >
                     Previous Result
                   </motion.div>
                )}
              </AnimatePresence>
              
              <div className="overflow-x-auto custom-scrollbar pb-2">
                <span className="text-4xl md:text-5xl font-mono font-bold text-foreground tracking-tight whitespace-nowrap">
                  {display || "0"}
                </span>
              </div>
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-4 gap-2.5 md:gap-3">
              <CalculatorButton onClick={handleClear} variant="destructive" className="text-red-600 bg-red-50 dark:bg-red-950/30">AC</CalculatorButton>
              <CalculatorButton onClick={handleDelete} variant="secondary"><Delete className="w-5 h-5" /></CalculatorButton>
              <CalculatorButton onClick={() => handleInput('%')} variant="secondary">%</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('÷')} variant="accent" className="text-2xl"><Divide className="w-6 h-6" /></CalculatorButton>

              <CalculatorButton onClick={() => handleInput('7')}>7</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('8')}>8</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('9')}>9</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('×')} variant="accent"><X className="w-5 h-5" /></CalculatorButton>

              <CalculatorButton onClick={() => handleInput('4')}>4</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('5')}>5</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('6')}>6</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('-')} variant="accent"><Minus className="w-6 h-6" /></CalculatorButton>

              <CalculatorButton onClick={() => handleInput('1')}>1</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('2')}>2</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('3')}>3</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('+')} variant="accent"><Plus className="w-6 h-6" /></CalculatorButton>

              <CalculatorButton onClick={() => handleInput('0')} span={2} className="pl-8 !justify-start">0</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('.')}>.</CalculatorButton>
              <CalculatorButton onClick={handleCalculate} variant="primary"><Equal className="w-6 h-6" /></CalculatorButton>
            </div>
            
            {/* Decorative background gradients */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>

        {/* History Panel (Sidebar on desktop, below on mobile) */}
        <div className="lg:col-span-5 h-[360px] lg:h-auto">
          <HistorySidebar className="h-full" />
        </div>

      </div>
    </div>
  );
}
