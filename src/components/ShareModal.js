import { useEffect } from "react";
import { shareContent } from "../utils/native";

export default function ShareModal({ isOpen, onClose, shareData, userId }) {
  useEffect(() => {
    if (isOpen) {
      handleShare();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleShare = async () => {
    try {
      const baseUrl = "https://dalmog123.github.io/SwipeItGame";
      const referralUrl = `${baseUrl}#ref=${userId}`;

      const shareDataWithReferral = {
        ...shareData,
        url: referralUrl,
      };

      // Native share sheet on iOS/Android; returns false in the browser
      const nativelyShared = await shareContent(shareDataWithReferral);

      if (!nativelyShared) {
        if (navigator.share) {
          await navigator.share(shareDataWithReferral);
        } else {
          await navigator.clipboard.writeText(
            `${shareDataWithReferral.text}\n${referralUrl}`
          );
          alert("Link copied to clipboard!");
        }
      }
      onClose();
    } catch (error) {
      console.error("Error sharing:", error);
      onClose();
    }
  };

  return null;
}
