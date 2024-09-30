import { getDoc, doc ,getDocs,collection, updateDoc, setDoc, arrayUnion, Timestamp} from "firebase/firestore";
import { db } from '../firebase/index.js';
const UpdateUser = async (data, uid) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userDocSnapshot = await getDoc(userDocRef);
    if (userDocSnapshot.exists()) {
      await updateDoc(userDocRef, data);
    } else {
      console.error("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    return null;
  }
};
const Updatewinnigs = async (data, uid) => {
  try {
    const winningsDocRef = doc(db, 'winning', uid);

    // Get the document
    const winningDocSnapshot = await getDoc(winningsDocRef);

    if (winningDocSnapshot.exists()) {
      // Document exists, update the array
      await updateDoc(winningsDocRef, {
        data: arrayUnion(...data)
      });
    } else {
      // Document does not exist, create a new one
      await setDoc(winningsDocRef, { data });
    }
  } catch (error) {
    console.error("Error updating document:", error);
  }
};


const UpdateDashBoard = async (data) => {
  try {
    const serverUrlDocRef = doc(db, "dashboard", 'set');

    // Get the document
    const serverUrlDocSnapshot = await getDoc(serverUrlDocRef);

    if (serverUrlDocSnapshot.exists()) {
      // Document exists, update the array
      await updateDoc(serverUrlDocRef,data);
    } else {
      // Document does not exist, create a new one
      await setDoc(serverUrlDocRef, { data });
    }
  } catch (error) {
    console.error("Error updating document:", error);
  }
};


const UpdateMegacontest = async (data) => {
  try {
    const megacontentDocRef = doc(db, 'dashboard', 'megacontest');

    // Get the document
    const megacontentDocRefDocSnapshot = await getDoc(megacontentDocRef);

    if (megacontentDocRefDocSnapshot.exists()) {
      // Document exists, update the array
      await updateDoc(megacontentDocRef, {
        data: arrayUnion(data)
      });
    } else {
      // Document does not exist, create a new one
      await setDoc(megacontentDocRef, { data:[data] });
    }
  } catch (error) {
    console.error("Error updating document:", error);
  }
};


// Function to update slot in Firestore
async function updateJoinedSlotInFirestoreBtn(key, data, userId, selectedInterval) {
  try {
    const docRef = doc(db, 'slots', selectedInterval);
    const docSnapshot = await getDoc(docRef);

    // If the document exists, update it; otherwise, create it
    if (docSnapshot.exists()) {
      // Update the user's data in the existing document
      await updateDoc(docRef, {
        [`${userId}.slots`]: arrayUnion(key), // Ensure slot is in the list
        [`${userId}.data.${key}`]: data, // Update the specific slot's data
      });
    } else {
      // Create the document if it doesn't exist
      await setDoc(docRef, {
        [userId]: {
          slots: [key], // Initialize the slots array with the current key
          data: {
            [key]: data, // Initialize data with the current slot's data
          },
        },
      });
    }

    // Fetch user data from Firestore (this assumes a separate user collection)
    const userDocRef = doc(db, 'users', userId);
    const userDocSnapshot = await getDoc(userDocRef);
    let userData = userDocSnapshot.exists() ? userDocSnapshot.data() : {};

    // Handle user's contest data
    const userContest = userData.contest || [];
    userContest.push({ [key]: data });

    // Update the user document in Firestore
    await updateDoc(userDocRef, {
      contest: userContest,
    });

    console.log('Slot updated successfully in Firestore');

  } catch (error) {
    console.error('Error updating Firestore:', error);
  }
}
  export {UpdateUser,Updatewinnigs,UpdateDashBoard,UpdateMegacontest,updateJoinedSlotInFirestoreBtn}