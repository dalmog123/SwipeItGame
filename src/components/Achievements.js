import React from 'react';
import { Trophy } from 'lucide-react';

export default function Achievement({ achievements = [], coins = 0 }) {
  return (
    <div className="bg-gradient-to-br from-blue-400 via-teal-300 to-green-500 rounded-lg shadow-md p-6 max-w-md w-full mb-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Achievements</h2>
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold text-white">Total Coins:</span>
        <span className="text-xl font-bold text-yellow-300">{coins}</span>
      </div>
      {achievements.length > 0 ? (
        <ul className="space-y-4 max-h-60 overflow-y-auto pr-2">
          {achievements.map((achievement) => (
            <li
              key={achievement.id}
              className={`flex items-center p-3 rounded-md ${
                achievement.isCompleted ? 'bg-green-200' : 'bg-white bg-opacity-50'
              }`}
            >
              <Trophy
                className={`mr-3 ${
                  achievement.isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              />
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-800">{achievement.title}</h3>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                {achievement.progress !== undefined && achievement.total !== undefined && (
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                    ></div>
                  </div>
                )}
                {achievement.progress !== undefined && achievement.total !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">
                    Progress: {achievement.progress} / {achievement.total}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-yellow-500">
                  {achievement.coinReward} coins
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white">No achievements available yet.</p>
      )}
    </div>
  );
}