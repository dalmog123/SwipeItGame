import { db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  onSnapshot,
  increment,
} from "firebase/firestore";

// Function to get shop items
export const getShopItems = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("Error getting shop items:", error);
    return null;
  }
};

// Function to listen to shop items changes
export const listenToShopItems = (userId, callback) => {
  try {
    const userRef = doc(db, "users", userId);
    return onSnapshot(
      userRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          // Explicitly check for zero
          const coins = data.coins === 0 ? 0 : Number(data.coins) || 0;
          callback({
            coins,
            shopItems: data.shopItems || {},
          });
        }
      },
      (error) => {
        console.error("Error in shop items listener:", error);
      }
    );
  } catch (error) {
    console.error("Error setting up shop items listener:", error);
  }
};

// Function to consume an extra life
export const consumeExtraLife = async (userId) => {
  try {
    if (!userId) throw new Error("No user ID provided");

    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return false;

    const userData = userDoc.data();
    if (!userData.shopItems || userData.shopItems["extra-lives"] <= 0)
      return false;

    await updateDoc(userRef, {
      "shopItems.extra-lives": increment(-1),
    });

    return true;
  } catch (error) {
    console.error("Error consuming extra life:", error);
    return false;
  }
};

// Function to consume double score
export const consumeDoubleScore = async (userId) => {
  try {
    if (!userId) throw new Error("No user ID provided");

    const userRef = doc(db, "users", userId);

    // Use increment instead of manual calculation
    await updateDoc(userRef, {
      "shopItems.double-score": increment(-1),
    });

    return true;
  } catch (error) {
    console.error("Error consuming double score:", error);
    return false;
  }
};

// Function to add shop items
export const addShopItems = async (userId, itemId, amount) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        coins: 0,
        shopItems: {
          "extra-lives": 0,
          "double-score": 0,
        },
      });
    }

    await updateDoc(userRef, {
      [`shopItems.${itemId}`]: increment(amount),
    });

    return true;
  } catch (error) {
    console.error("Error adding shop items:", error);
    return false;
  }
};

// Function to purchase shop items
export const purchaseShopItem = async (userId, itemId, price) => {
  try {
    if (!userId) throw new Error("No user ID provided");

    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        coins: 0,
        shopItems: {
          "extra-lives": 0,
          "double-score": 0,
        },
      });
      return false;
    }

    const userData = userDoc.data();
    if (userData.coins < price) return false;

    // Force an explicit zero if the result would be zero
    const newCoins = userData.coins - price;
    await updateDoc(userRef, {
      coins: newCoins === 0 ? 0 : increment(-price),
      [`shopItems.${itemId}`]: increment(1),
    });

    return true;
  } catch (error) {
    console.error("Error purchasing item:", error);
    return false;
  }
};
