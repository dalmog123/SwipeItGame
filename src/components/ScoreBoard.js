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

  useEffect(() => {
    const fetchScores = async () => {
      try {
        // Fetch from both collections
        const scoresSnapshot = await getDocs(collection(db, "scores"));
        const usersSnapshot = await getDocs(collection(db, "users"));

        // Process old scores
        const oldScores = scoresSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Process new scores from users collection
        const newScores = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          userId: doc.id, // In users collection, document ID is the userId
          player:
            doc.data().player ||
            doc.data().username ||
            `Player${Math.floor(Math.random() * 9999999)}`,
          score: doc.data().highScore || 0,
        }));

        // Merge both arrays
        const allScores = [...oldScores, ...newScores];

        // Sort all scores by score in descending order
        newScores.sort((a, b) => b.score - a.score);

        setScores(newScores);

        // Scroll to user's position (existing code)
        const userIndex = allScores.findIndex(
          (score) => score.userId === currentUserId
        );
        if (userIndex !== -1 && scoreRef.current) {
          setTimeout(() => {
            scoreRef.current.children[userIndex]?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 500);
        }
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-teal-500 to-green-600 p-2 sm:p-4 md:p-6 overflow-hidden">
      <div
        className="relative bg-gray-900 bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl p-3 sm:p-6 md:p-8 max-w-2xl w-full flex flex-col"
        style={{ height: "95vh" }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed top-4 left-4 p-2 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors z-50"
          onClick={onBack}
        >
          <ArrowLeft size={24} />
        </motion.button>

        <h1
          className="font-bold text-center text-gray-100 mb-4 sm:mb-8"
          style={{ fontSize: "clamp(1.2rem, 5vw, 4rem)" }}
        >
          Leaderboard
        </h1>

        <div className="flex justify-center space-x-1 sm:space-x-2 mb-4">
          {["daily", "weekly", "monthly"].map((period) => (
            <button
              key={period}
              className={`px-2 sm:px-6 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

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
              className={`flex items-center rounded-2xl p-2 sm:p-4 transition-colors ${
                score.userId === currentUserId
                  ? "bg-blue-600 bg-opacity-50 hover:bg-opacity-70"
                  : "bg-gray-800 bg-opacity-50 hover:bg-opacity-70"
              }`}
            >
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-grow">
                    {getRankIcon(index + 1) || (
                      <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-sm sm:text-base">
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
                            className="bg-gray-700 text-gray-100 px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm sm:text-base"
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
                          <span className="text-base sm:text-xl font-semibold text-gray-100">
                            {score.player}
                          </span>
                          {score.userId === currentUserId && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                startEditing(score.id, score.player)
                              }
                              className="ml-2 p-1 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                            >
                              <Edit2 size={16} />
                            </motion.button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xl sm:text-3xl font-bold text-blue-300 ml-2 sm:ml-4">
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
