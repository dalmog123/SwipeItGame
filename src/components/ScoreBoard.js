import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal, Award, Edit2, Check, X } from 'lucide-react';
import { db } from '../firebase/firebase';
import { getDocs, collection, doc, updateDoc } from 'firebase/firestore';

export default function ScoreBoard({ onBack = () => {}, currentUserId }) {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [scores, setScores] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      const querySnapshot = await getDocs(collection(db, 'scores'));
      const fetchedScores = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort scores by score in descending order
      fetchedScores.sort((a, b) => b.score - a.score);
      setScores(fetchedScores);
    };

    fetchScores();
  }, []);

  const handleRename = async (id) => {
    if (!newName) return; // Prevent empty names
    try {
      const scoreRef = doc(db, 'scores', id); // Reference to the specific document
      await updateDoc(scoreRef, { player: newName }); // Update the player's name
      setScores(scores.map(score => (score.id === id ? { ...score, player: newName } : score)));
      setNewName(''); // Clear the input field
      setEditingId(null); // Reset editing state
    } catch (error) {
      console.error("Error updating player name: ", error);
    }
  };

  const startEditing = (id, currentName) => {
    setEditingId(id);
    setNewName(currentName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewName('');
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-teal-500 to-green-600 p-4 sm:p-6 overflow-hidden">
      <div className="relative bg-gray-900 bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full flex flex-col" style={{ height: "95vh" }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed top-4 left-4 p-2 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors z-50"
          onClick={onBack}
        >
          <ArrowLeft size={24} />
        </motion.button>

        <h1 className="font-bold text-center text-gray-100 mb-8" style={{ fontSize: 'clamp(1.5rem, 8vw, 4rem)' }}>
          Leaderboard
        </h1>

        <div className="flex justify-center space-x-2 mb-4">
          {['daily', 'weekly', 'monthly'].map((period) => (
            <button
              key={period}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-grow overflow-y-auto space-y-4">
          {scores.map((score, index) => (
            <motion.div
              key={score.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center bg-gray-800 bg-opacity-50 rounded-2xl p-4 hover:bg-opacity-70 transition-colors"
            >
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-grow">
                    {getRankIcon(index + 1) || (
                      <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
                        {index + 1}
                      </span>
                    )}
                    <div className="ml-4 flex-grow">
                      {editingId === score.id && score.userId === currentUserId ? ( // Allow editing only for the current user's score
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="bg-gray-700 text-gray-100 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
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
                          <span className="text-xl font-semibold text-gray-100">{score.player}</span>
                          {score.userId === currentUserId && ( // Show edit button only for current user's score
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => startEditing(score.id, score.player)}
                              className="ml-2 p-1 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                            >
                              <Edit2 size={16} />
                            </motion.button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-300 ml-4">
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
