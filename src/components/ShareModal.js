import { useEffect } from "react";

export default function ShareModal({ isOpen, onClose, shareData, userId }) {
  useEffect(() => {
    if (isOpen) {
      handleShare();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleShare = async () => {
    try {
      const referralUrl = `${shareData.url}#ref=${userId}`;
      const shareDataWithReferral = {
        ...shareData,
        url: referralUrl,
      };

      if (navigator.share) {
        await navigator.share(shareDataWithReferral);
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(
          `${shareDataWithReferral.text}\n${referralUrl}`
        );
        alert("Link copied to clipboard!");
      }
      onClose();
    } catch (error) {
      console.error("Error sharing:", error);
      onClose();
    }
  };

  return null; // Don't render anything
}
