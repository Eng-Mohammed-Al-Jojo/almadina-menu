import { motion } from "framer-motion";

export default function MenuSkeleton() {
  // Array of 3 skeletons to mimic categories
  const categories = [1, 2, 3];

  return (
    <div className="w-full flex flex-col gap-6 pt-4">
      {categories.map((cat, i) => (
        <motion.div
          key={cat}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
          className="w-full flex flex-col gap-4"
        >
          {/* Category Header Skeleton */}
          <div className="w-full h-48 sm:h-56 relative overflow-hidden rounded-4xl bg-(--bg-card)/60 border border-(--border-color) shadow-sm">
            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent z-10"
              animate={{ translateX: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
            
            <div className="absolute inset-x-4 bottom-3 flex items-end justify-between">
              <div className="flex flex-col gap-2 w-1/3">
                <div className="h-6 w-full bg-(--text-muted)/20 rounded-full" />
                <div className="h-3 w-1/2 bg-(--text-muted)/10 rounded-full" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-(--text-muted)/10" />
            </div>
          </div>

          {/* Items Skeleton Layout (expanded automatically in skeleton mode) */}
          <div className="flex flex-col gap-3 px-2">
            {[1, 2, 3].map((item, j) => (
              <div
                key={item}
                className="relative flex flex-col sm:flex-row gap-4 p-4 sm:p-5 bg-(--bg-card)/40 rounded-4xl border border-(--border-color) overflow-hidden"
              >
                {/* Item Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/5 to-transparent z-10"
                  animate={{ translateX: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.2 + (j * 0.1), ease: "easeInOut" }}
                />

                <div className="flex-1 flex flex-col gap-3 justify-center">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2 w-full">
                      <div className="h-4 w-3/4 sm:w-1/3 bg-(--text-muted)/20 rounded-full" />
                      <div className="h-3 w-full sm:w-2/3 bg-(--text-muted)/10 rounded-full" />
                      <div className="h-3 w-2/3 sm:w-1/2 bg-(--text-muted)/10 rounded-full" />
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className="h-5 w-16 bg-(--text-muted)/20 rounded-full" />
                      <div className="flex gap-2 mt-1">
                         <div className="w-8 h-8 rounded-xl bg-(--text-muted)/10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
