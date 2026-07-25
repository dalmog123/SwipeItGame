import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Medal, Award, Edit2, Check, X } from "lucide-react";
import { db } from "../firebase/firebase";
import { getDocs, collection, doc, updateDoc } from "firebase/firestore";

export default function ScoreBoard({ onBack = () => {}, currentUserId }) {
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [scores, setScores] = useState([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const scoreRef = useRef(null);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));

        // Process scores from users collection
        const newScores = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          userId: doc.id,
          player:
            doc.data().player ||
            doc.data().username ||
            `Player${Math.floor(Math.random() * 9999999)}`,
          score: doc.data().highScore || 0,
        }));

        // Sort all scores by score in descending order
        newScores.sort((a, b) => b.score - a.score);

        // Get current user's stats
        const userPosition = newScores.findIndex(
          (score) => score.userId === currentUserId
        );
        if (userPosition !== -1) {
          setUserStats({
            rank: userPosition + 1,
            ...newScores[userPosition],
          });
        }

        // Only show top 50 scores in the leaderboard
        setScores(newScores.slice(0, 50));

        // Scroll handling...
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    };

    fetchScores();
  }, [currentUserId]);

  const handleRename = async (id) => {
    if (!newName || newName.length > 15) return;
    try {
      // Check which collection the score belongs to
      const isNewUser = scores.find((score) => score.id === id)?.userId === id;
      const collectionName = isNewUser ? "users" : "scores";

      const docRef = doc(db, collectionName, id);

      // Update based on collection type
      if (isNewUser) {
        await updateDoc(docRef, { username: newName });
      } else {
        await updateDoc(docRef, { player: newName });
      }

      // Update local state
      setScores(
        scores.map((score) =>
          score.id === id ? { ...score, player: newName } : score
        )
      );
      setNewName("");
      setEditingId(null);
    } catch (error) {
      console.error("Error updating player name: ", error);
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    // Regex to allow only alphanumeric characters and underscores
    const regex = /^[a-zA-Z0-9_]*$/;
    // Set new name only if it matches the regex and is not longer than 12 characters
    if (value.length <= 15 && regex.test(value)) {
      setNewName(value);
    }
  };

  const startEditing = (id, currentName) => {
    setEditingId(id);
    setNewName(currentName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewName("");
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-300" />;
      case 3:
        return <Award className="w-8 h-8 text-orange-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-base p-2 sm:p-4 md:p-6 overflow-hidden">
      <div
        className="relative bg-bg-panel/80 border border-line backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl p-3 sm:p-6 md:p-8 max-w-2xl w-full flex flex-col"
        style={{ height: "95vh" }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 p-2 sm:p-2.5 md:p-3 rounded-full bg-white/10 border border-white/15 text-ink-hi hover:bg-white/20 transition-colors z-50"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 min-w-[20px] min-h-[20px] max-w-[28px] max-h-[28px]" />
        </motion.button>

        <h1
          className="font-display font-bold text-center text-ink-hi mb-4 tracking-widest uppercase"
          style={{ fontSize: "clamp(1.1rem, 4.5vw, 3rem)" }}
        >
          Leaderboard
        </h1>

        {/* Player Stats Card */}
        {userStats && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neon-up/15 border border-neon-up/30 rounded-2xl p-2 sm:p-3 md:p-4 mb-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-neon-up/30 flex items-center justify-center">
                  <span className="font-numeric text-base sm:text-lg md:text-xl font-bold text-ink-hi">
                    #{userStats.rank}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ink-hi">
                    {userStats.player}
                  </h2>
                  <p className="text-sm sm:text-base text-ink-lo">
                    Your Ranking
                  </p>
                </div>
              </div>
              <div className="font-numeric text-xl sm:text-2xl md:text-3xl font-bold text-neon-up text-glow">
                {userStats.score.toLocaleString()}
              </div>
            </div>
          </motion.div>
        )}

        {/* Top 50 Title */}
        {/* <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold text-gray-100 mb-4 text-center"
        >
          Top 50
        </motion.h2> */}

        {/* Existing leaderboard scrollable section */}
        <div
          className="flex-grow overflow-y-auto space-y-2 sm:space-y-4"
          ref={scoreRef}
        >
          {scores.map((score, index) => (
            <motion.div
              key={score.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center rounded-2xl p-2 sm:p-4 transition-colors border ${
                score.userId === currentUserId
                  ? "bg-neon-up/15 border-neon-up/40 hover:bg-neon-up/25"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-grow">
                    {getRankIcon(index + 1) || (
                      <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-ink-lo font-numeric text-sm sm:text-base">
                        {index + 1}
                      </span>
                    )}
                    <div className="ml-2 sm:ml-4 flex-grow">
                      {editingId === score.id &&
                      score.userId === currentUserId ? (
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <input
                            type="text"
                            value={newName}
                            onChange={handleNameChange}
                            className="bg-white/10 text-ink-hi px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-up w-full text-sm sm:text-base"
                            placeholder={score.player}
                            autoFocus
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRename(score.id)}
                            className="p-1 rounded-full bg-green-500 text-white hover:bg-green-600"
                          >
                            <Check size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={cancelEditing}
                            className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                          >
                            <X size={16} />
                          </motion.button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="text-base sm:text-xl font-semibold text-ink-hi">
                            {score.player}
                          </span>
                          {score.userId === currentUserId && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                startEditing(score.id, score.player)
                              }
                              className="ml-2 p-1 rounded-full text-ink-lo hover:text-ink-hi hover:bg-white/10"
                            >
                              <Edit2 size={16} />
                            </motion.button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="font-numeric text-xl sm:text-3xl font-bold text-neon-up ml-2 sm:ml-4">
                    {score.score.toLocaleString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
