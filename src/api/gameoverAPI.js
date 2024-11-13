import { db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  increment,
} from "firebase/firestore";

// Function to get user data from Firebase
export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("Error fetching user data: ", error);
    return null;
  }
};

// Function to set user data in Firebase
export const setUserData = async (userId, data) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, data, { merge: true });
    console.log("User data updated successfully!");
  } catch (error) {
    console.error("Error updating user data: ", error);
  }
};

// Function to update specific fields in user data
export const updateUserData = async (userId, updates) => {
  if (!userId) return;

  try {
    // Validate numerical values before updating
    const validatedUpdates = { ...updates };
    if ("coins" in updates) {
      validatedUpdates.coins = Math.max(
        0,
        Math.floor(Number(updates.coins) || 0)
      );
    }
    if ("totalCoinsEarned" in updates) {
      validatedUpdates.totalCoinsEarned = Math.max(
        0,
        Math.floor(Number(updates.totalCoinsEarned) || 0)
      );
    }

    console.log("Updating user data with validated values:", validatedUpdates);

    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, validatedUpdates);
      return;
    }

    const currentData = userDoc.data();
    const hasChanges = Object.keys(validatedUpdates).some(
      (key) =>
        JSON.stringify(validatedUpdates[key]) !==
        JSON.stringify(currentData[key])
    );

    if (hasChanges) {
      await updateDoc(userRef, validatedUpdates);
    }
  } catch (error) {
    console.error("Error updating user data:", error);
  }
};

// Function to listen for real-time updates
export const listenToUserData = (userId, callback) => {
  try {
    const userRef = doc(db, "users", userId);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  } catch (error) {
    console.error("Error listening to user data: ", error);
  }
};

// Function to update coins and achievements
export const updateCoinsAndAchievements = async (userId, newCoins) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const currentData = userDoc.data();

      // Strict number validation
      const validateNumber = (value) => {
        const num = Number(value);
        return !isNaN(num) && isFinite(num) ? num : 0;
      };

      // Convert all coin values to numbers with validation
      const safeNewCoins = validateNumber(newCoins);
      const currentTotalCoins = validateNumber(currentData.totalCoinsEarned);
      const currentUserCoins = validateNumber(currentData.coins);

      // Calculate new totals
      const totalCoinsEarned = currentTotalCoins + safeNewCoins;
      const currentCoins = currentUserCoins + safeNewCoins;

      // Double-check that our final values are valid numbers
      if (isNaN(totalCoinsEarned) || isNaN(currentCoins)) {
        console.error("Invalid coin calculations:", {
          totalCoinsEarned,
          currentCoins,
          inputs: {
            safeNewCoins,
            currentTotalCoins,
            currentUserCoins,
          },
        });
        return; // Don't update if we have invalid numbers
      }

      // Update achievements based on total coins earned
      const updatedAchievements = currentData.achievements.map(
        (achievement) => {
          if (achievement.id === "coinCollector") {
            return {
              ...achievement,
              progress: totalCoinsEarned,
            };
          }
          return achievement;
        }
      );

      // Final validation before update
      const updates = {
        coins: Math.max(0, Math.floor(currentCoins)), // Ensure positive integer
        totalCoinsEarned: Math.max(0, Math.floor(totalCoinsEarned)), // Ensure positive integer
        achievements: updatedAchievements,
      };

      console.log("Debug - Final update values:", updates);

      // Update everything in one call
      await updateDoc(userRef, updates);
      console.log("Coins and achievements updated successfully!");
    } else {
      // If user doesn't exist, initialize with zero coins and default achievements
      const DEFAULT_ACHIEVEMENTS = [
        {
          id: "coinCollector",
          progress: 0,
          // ... other achievement properties
        },
      ];
      await setDoc(userRef, {
        coins: 0,
        totalCoinsEarned: 0,
        achievements: DEFAULT_ACHIEVEMENTS,
      });
    }
  } catch (error) {
    console.error("Error updating coins and achievements:", error);
  }
};

// Add these new functions
export const handleReferral = async (referrerId, newUserId) => {
  if (!referrerId || !newUserId) return;

  try {
    const referrerDoc = doc(db, "users", referrerId);
    const referrerData = await getDoc(referrerDoc);

    if (referrerData.exists()) {
      // Get or initialize the referredUsers array
      const referredUsers = referrerData.data().referredUsers || [];

      // Check if this user has already been referred
      if (!referredUsers.includes(newUserId)) {
        // Award coins to referrer
        const currentCoins = referrerData.data().coins || 0;
        const currentTotalCoins = referrerData.data().totalCoinsEarned || 0;

        await updateDoc(referrerDoc, {
          coins: currentCoins + 200,
          totalCoinsEarned: currentTotalCoins + 200,
          referrals: increment(1),
          referredUsers: [...referredUsers, newUserId], // Add new user to the list
        });
      }
    }
  } catch (error) {
    console.error("Error handling referral:", error);
  }
};

export const checkAndProcessReferral = async (currentUserId) => {
  if (!currentUserId) return;

  try {
    // Check for referral in hash instead of search params
    const hash = window.location.hash;
    const referrerId = hash.match(/#ref=([^&]*)/)?.[1];

    if (referrerId && referrerId !== currentUserId) {
      const userDoc = await getDoc(doc(db, "users", currentUserId));
      const isNewUser = !userDoc.exists();

      if (isNewUser) {
        await handleReferral(referrerId, currentUserId);
      }
    }
  } catch (error) {
    console.error("Error processing referral:", error);
  }
};
