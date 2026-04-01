import React from 'react';
import { motion } from 'framer-motion';

export default function VideoToolSelector({ tools, onSelect }) {
  // Separate tools by category
  const videoTools = tools.filter(t => t.category === 'Video');
  const imageTools = tools.filter(t => t.category === 'Image');

  const ToolCard = ({ tool, index }) => (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(tool.id)}
      className="p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:border-white/40 transition-all text-left group"
    >
      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{tool.icon}</div>
      <h3 className="text-white font-semibold">{tool.name}</h3>
    </motion.button>
  );

  return (
    <div className="space-y-12">
      {/* Video Tools */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
          🎬 Video Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoTools.map((tool, idx) => (
            <ToolCard key={tool.id} tool={tool} index={idx} />
          ))}
        </div>
      </div>

      {/* Image Tools */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
          🖼️ Image Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imageTools.map((tool, idx) => (
            <ToolCard key={tool.id} tool={tool} index={idx + videoTools.length} />
          ))}
        </div>
      </div>
    </div>
  );
}