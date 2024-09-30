import { getDoc, doc } from "firebase/firestore";
import { db } from '../firebase/index.js';

const ReadUser = async (uid) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      // Access the document data
      const data = userDocSnapshot.data();
      return data; // Return the document data
    } else {
      console.error("No such document!");
      return null; // Return null if the document does not exist
    }
  } catch (error) {
    console.error("Error getting document:", error);
    return null; // Return null in case of an error
  }
};
const ReadDashBoard = async (key) => {
  try {
    const dashBoardDocRef = doc(db, "dashboard", key);
    const dashBoardDocSnapshot = await getDoc(dashBoardDocRef);

    if (dashBoardDocSnapshot.exists()) {
      // Access the document data
      const data = dashBoardDocSnapshot.data();
      return data; // Return the document data
    } else {
      console.error("No such document!");
      return null; // Return null if the document does not exist
    }
  } catch (error) {
    console.error("Error getting document:", error);
    return null; // Return null in case of an error
  }
};
export { ReadUser,ReadDashBoard };
