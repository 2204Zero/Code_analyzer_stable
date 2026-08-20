import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function GlassPanel({ children, className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div 
      className={cn("bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-zinc-300 overflow-hidden", className)} 
      {...props}
    >
      {children}
    </motion.div>
  );
}
