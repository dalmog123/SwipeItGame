import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Facebook,
  MessageCircle,
  Twitter,
  Link2,
  Share2,
} from "lucide-react";

export default function ShareModal({ isOpen, onClose, shareData, userId }) {
  if (!isOpen) return null;

  const referralUrl = `${shareData.url}?ref=${userId}`;

  const shareOptions = [
    {
      name: "Copy Link",
      icon: Link2,
      action: async () => {
        await navigator.clipboard.writeText(referralUrl);
        alert("Link copied!");
        onClose();
      },
    },
    {
      name: "Message",
      icon: MessageCircle,
      action: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `${shareData.text}\n${referralUrl}`
          )}`
        );
        onClose();
      },
    },
    {
      name: "Twitter",
      icon: Twitter,
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareData.text
          )}&url=${encodeURIComponent(referralUrl)}`
        );
        onClose();
      },
    },
    {
      name: "Facebook",
      icon: Facebook,
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            referralUrl
          )}`
        );
        onClose();
      },
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 w-full max-w-sm relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Share with friends
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.action}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <option.icon size={24} className="mb-2 text-gray-700" />
                <span className="text-sm text-gray-600">{option.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
