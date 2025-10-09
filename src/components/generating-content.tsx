import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const AIGeneratingContent = () => {
  return (
    <motion.div
      className="bg-muted/40 text-muted-foreground flex items-center gap-3 rounded-lg px-5 py-4 text-sm shadow-sm"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Sparkle icon with animated glow */}
      <motion.div
        className="relative flex h-6 w-6 items-center justify-center"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "mirror",
        }}
      >
        <Sparkles className="text-primary h-4 w-4 drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
        <motion.div
          className="bg-primary/20 absolute inset-0 rounded-full blur-md"
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Animated gradient text */}
      <motion.span
        className="from-primary/90 via-foreground/80 to-primary/90 bg-gradient-to-r bg-clip-text font-medium text-transparent"
        animate={{ backgroundPosition: ["0%", "100%"] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "mirror",
        }}
        style={{
          backgroundSize: "200% auto",
        }}
      >
        AI is generating content for your project...
      </motion.span>
    </motion.div>
  );
};

export default AIGeneratingContent;
