import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../Firebase";
import { FaWhatsapp, FaTrash } from "react-icons/fa"; // Import FaTrash instead of FaPlus
import Navbar2 from "./Navbar2";
import Footer from "./Footer";

const ShowSubmissionAndUserData = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook to navigate after deletion

  const [submissionData, setSubmissionData] = useState(null);
  const [userDataList, setUserDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const docRef = doc(db, "cartSubmissions", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const submission = docSnap.data();
          setSubmissionData(submission);

          if (submission.itemIds && Array.isArray(submission.itemIds)) {
            await fetchUserDataList(submission.itemIds);
          } else {
            setError("No valid user ID list found in the submission data.");
          }
        } else {
          setError("No submission found with the provided ID.");
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("An error occurred while fetching the submission data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserDataList = async (userIds) => {
      try {
        const userDataPromises = userIds.map(async (userId) => {
          const docRef = doc(db, "users", userId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { userId, ...docSnap.data() };
          } else {
            return { userId, error: "No user found with the provided User ID." };
          }
        });
        const userDataResults = await Promise.all(userDataPromises);
        setUserDataList(userDataResults);
      } catch (err) {
        console.error("Error fetching user documents:", err);
        setError("An error occurred while fetching the user data.");
      }
    };

    fetchSubmission();
  }, [id]);

  // Function to handle cart deletion
  const deleteCart = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this cart submission?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "cartSubmissions", id));
      alert("Cart submission deleted successfully.");
      navigate("/"); // Redirect to home or another page after deletion
    } catch (err) {
      console.error("Error deleting cart submission:", err);
      alert("An error occurred while deleting the cart submission.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-8 bg-white shadow-lg rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar2 />
      <div className="bg-gray-100 p-4 min-h-screen">
        {/* Optional: Add a Delete Cart button at the top */}
        <div className="flex justify-end mb-4">
          <button
            onClick={deleteCart}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-transform duration-300 hover:scale-105"
          >
            Delete Cart
          </button>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {userDataList.map((user, index) => (
            <div
              key={index}
              className="bg-white border rounded-lg shadow-lg overflow-hidden flex flex-col"
            >
              {/* Top Image */}
              <Link to="/profile">
                <div className="w-full h-40 bg-gray-100 overflow-hidden">
                  <img
                    src={user.photo || "https://via.placeholder.com/150"}
                    alt={user.name}
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>

              {/* Bottom Content */}
              <div className="flex flex-col flex-grow p-4">
                {/* Avatar and Name */}
                <Link to="/profile">
                  <div className="flex items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {user.avatar || "N/A"}
                    </h3>
                  </div>
                </Link>

                {/* Height and Bicep */}
                <div className="flex justify-between text-[15px] mb-2">
                  <div className="text-gray-700">
                    <span className="font-medium">Height:</span> {user.tall || "N/A"}
                  </div>
                  <div className="text-gray-700">
                    <span className="font-medium">Bicep:</span> {user.biceps || "N/A"}
                  </div>
                </div>

                {/* Experience and Reference */}
                <div className="flex justify-between text-[15px] mb-2">
                  <div className="text-gray-700">
                    <span className="font-medium">Exp:</span> {user.exp || "N/A"} Years
                  </div>
                  <div className="text-gray-700">
                    <span className="font-medium">Ref:</span> {user.reffer || "None"}
                  </div>
                </div>

                {/* Spacer to push footer to bottom */}
                <div className="flex-grow"></div>

                {/* Footer */}
                <div className="mt-4 border-t pt-4 flex items-center justify-between">
                  {/* Price */}
                  <div className="text-lg font-medium">₹{user.price || "N/A"}</div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {/* WhatsApp Button */}
                    <button
                      onClick={() => {
                        const serviceUrl = `${window.location.origin}/profile/${user.userId}`;
                        const message = `Check out this service: ${user.name}\nPrice: ₹${user.price}\nLink: ${serviceUrl}`;
                        const encodedMessage = encodeURIComponent(message);
                        const whatsappUrl = `https://wa.me/${user.phone}?text=${encodedMessage}`;
                        window.open(whatsappUrl, "_blank");
                      }}
                      className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center transition-transform duration-300 hover:scale-105"
                    >
                      <FaWhatsapp className="text-xl" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        const confirmDelete = window.confirm(
                          `Are you sure you want to delete the user "${user.name}" from this cart?`
                        );
                        if (!confirmDelete) return;

                        // Remove the user from the userDataList state
                        setUserDataList((prevList) =>
                          prevList.filter((item) => item.userId !== user.userId)
                        );

                        // Optionally, update the cart submission in Firestore
                        // to remove the userId from the itemIds array
                        // This requires more implementation based on your Firestore structure
                        // Example:
                        // const updatedItemIds = submissionData.itemIds.filter(id => id !== user.userId);
                        // await updateDoc(doc(db, "cartSubmissions", id), { itemIds: updatedItemIds });
                      }}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center transition-transform duration-300 hover:scale-105"
                    >
                      <FaTrash className="text-xl" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Handle case when userDataList is empty after deletions */}
          {userDataList.length === 0 && (
            <div className="col-span-full text-center text-gray-700">
              No users in this cart.
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ShowSubmissionAndUserData;
