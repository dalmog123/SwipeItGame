import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';

const leaderboardData = [
  { rank: 1, name: "Alex", score: 2500 },
  { rank: 2, name: "Sam", score: 2350 },
  { rank: 3, name: "Jordan", score: 2200 },
  { rank: 4, name: "Taylor", score: 2100 },
  { rank: 5, name: "Casey", score: 2000 },
  { rank: 6, name: "Morgan", score: 1950 },
  { rank: 7, name: "Jamie", score: 1900 },
  { rank: 8, name: "Riley", score: 1850 },
  { rank: 9, name: "Quinn", score: 1800 },
  { rank: 10, name: "Avery", score: 1750 },
];

export default function ScoreBoard({ onBack = () => {} }) {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');

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
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-teal-500 to-green-600 p-4 sm:p-6 overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div
        className="relative bg-gray-900 bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full flex flex-col"
        style={{ height: "95vh", paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
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
              className={`flex items-center justify-center px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              style={{ minWidth: "10vw", maxWidth: "35vw" }} // More flexible width
              onClick={() => setSelectedPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {/* Scrollable leaderboard section */}
        <div className="flex-grow overflow-y-auto space-y-4">
          {leaderboardData.map((entry, index) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center bg-gray-800 bg-opacity-50 rounded-2xl p-4 hover:bg-opacity-70 transition-colors"
            >
              <div className="w-12 h-12 flex items-center justify-center text-2xl font-bold text-gray-200 mr-4">
                {getRankIcon(entry.rank) || (
                  <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    {entry.rank}
                  </span>
                )}
              </div>
              <div className="flex-grow">
                <div className="text-xl font-semibold text-gray-100">{entry.name}</div>
                <div className="text-sm text-gray-400">Rank: #{entry.rank}</div>
              </div>
              <div className="text-3xl font-bold text-blue-300">{entry.score.toLocaleString()}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
