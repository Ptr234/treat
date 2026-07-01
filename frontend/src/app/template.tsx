'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * App-wide route transition. A subtle opacity fade on every navigation —
 * opacity only (no transform) so it never creates a containing block that
 * would disrupt position:fixed overlays inside pages.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
