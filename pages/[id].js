// components/ShowSubmissionAndUserData.jsx

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import {
  FaWhatsapp,
  FaTrash,
  FaCheck,
  FaTimes,
  FaCartPlus,
  FaArrowLeft,
} from "react-icons/fa";
import Navbar2 from "@/components/Navbar2";
import Footer from "@/components/Footer";
import Link from "next/link";
import { db } from "@/Firebase";
import { toast } from "react-toastify";

const ShowSubmissionAndUserData = () => {
  const router = useRouter();
  const { id } = router.query;

  const [submissionData, setSubmissionData] = useState(null);
  const [userDataList, setUserDataList] = useState([]);
  const [approvedItemIds, setApprovedItemIds] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCartVisible, setIsCartVisible] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchSubmission = async () => {
      try {
        const docRef = doc(db, "cartSubmissions", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const submission = docSnap.data();
          setSubmissionData(submission);
          const approvedIds = submission.approvedItemIds || [];
          setApprovedItemIds(approvedIds);

          if (submission.itemIds && Array.isArray(submission.itemIds)) {
            await fetchUserDataList(submission.itemIds);
          } else {
            setError("No valid user ID list found in the submission data.");
          }

          // If there are approved items, fetch their data and add to approvedUsers
          if (approvedIds.length > 0) {
            await fetchApprovedUsers(approvedIds);
            setIsCartVisible(true); // Show the cart if there are approved items
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
            return {
              userId,
              error: "No user found with the provided User ID.",
            };
          }
        });
        const userDataResults = await Promise.all(userDataPromises);
        setUserDataList(userDataResults);
      } catch (err) {
        console.error("Error fetching user documents:", err);
        setError("An error occurred while fetching the user data.");
      }
    };

    const fetchApprovedUsers = async (approvedUserIds) => {
      try {
        const approvedUserDataPromises = approvedUserIds.map(async (userId) => {
          const docRef = doc(db, "users", userId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { userId, ...docSnap.data() };
          } else {
            return null;
          }
        });
        const approvedUserDataResults = await Promise.all(
          approvedUserDataPromises
        );
        const approvedUsersData = approvedUserDataResults.filter(
          (user) => user !== null
        );
        setApprovedUsers(approvedUsersData);
        if (approvedUsersData.length > 0) {
          setIsCartVisible(true);
        } else {
          setIsCartVisible(false);
        }
      } catch (err) {
        console.error("Error fetching approved user documents:", err);
        setError("An error occurred while fetching the approved user data.");
      }
    };

    fetchSubmission();
  }, [id]);

  // Function to handle approving a user
  const handleApprove = async (userId) => {
    if (!id) {
      setError("Invalid submission ID.");
      return;
    }

    if (approvedItemIds.includes(userId)) {
      toast.info("User is already approved.");
      return;
    }

    try {
      const docRef = doc(db, "cartSubmissions", id);
      await updateDoc(docRef, {
        approvedItemIds: arrayUnion(userId),
      });

      // Update local approvedItemIds state
      setApprovedItemIds((prev) => [...prev, userId]);

      // Add to approvedUsers
      const approvedUser = userDataList.find((user) => user.userId === userId);
      if (approvedUser) {
        setApprovedUsers((prev) => [...prev, approvedUser]);
        setIsCartVisible(true); // Show the cart after approval
        toast.success(
          `${approvedUser.name} has been approved and added to the cart!`
        );
      }
    } catch (err) {
      console.error("Error approving item:", err);
      setError("An error occurred while approving the item.");
    }
  };

  // Function to handle rejecting a user
  const handleReject = async (userId) => {
    if (!id) {
      setError("Invalid submission ID.");
      return;
    }

    try {
      const docRef = doc(db, "cartSubmissions", id);
      await updateDoc(docRef, {
        itemIds: arrayRemove(userId),
        approvedItemIds: arrayRemove(userId),
      });

      // Update local approvedItemIds state
      setApprovedItemIds((prev) => prev.filter((id) => id !== userId));

      // Remove from approvedUsers if present
      setApprovedUsers((prev) => prev.filter((user) => user.userId !== userId));

      toast.success("Item rejected and removed from the submission.");

      // Update local user data list
      setUserDataList((prevList) =>
        prevList.filter((user) => user.userId !== userId)
      );
    } catch (err) {
      console.error("Error rejecting item:", err);
      setError("An error occurred while rejecting the item.");
    }
  };

  // Function to handle removing an item from the cart
  const handleRemoveFromCart = async (userId) => {
    if (!id) {
      setError("Invalid submission ID.");
      return;
    }

    try {
      const docRef = doc(db, "cartSubmissions", id);

      // Verify the document exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error("Submission document does not exist.");
      }

      await updateDoc(docRef, {
        approvedItemIds: arrayRemove(userId),
      });

      // Update local approvedItemIds state
      setApprovedItemIds((prev) => prev.filter((id) => id !== userId));

      // Remove from approvedUsers
      setApprovedUsers((prev) => prev.filter((user) => user.userId !== userId));

      toast.success("Item removed from the cart.");

      if (approvedUsers.length === 1) {
        // After removal, approvedUsers will be empty
        setIsCartVisible(false);
      }
    } catch (err) {
      console.error("Error removing item from cart:", err);
      setError(
        `An error occurred while removing the item from the cart: ${err.message}`
      );
    }
  };

  // Function to generate WhatsApp share link
  const generateWhatsAppLink = () => {
    if (approvedUsers.length === 0) {
      toast.error("No approved users. Nothing to share.");
      return "#";
    }

    const message =
      `Approved Items:\n` +
      approvedUsers
        .map(
          (item) =>
            `- ${item.name} (Height: ${item.tall}, Bicep: ${item.biceps})`
        )
        .join("\n");
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/?text=${encodedMessage}`;
  };

  // Function to handle submitting the list
  const handleSubmitList = () => {
    const link = generateWhatsAppLink();
    if (link !== "#") {
      window.open(link, "_blank");
    }
  };

  // Function to toggle cart visibility
  const toggleCartVisibility = () => {
    setIsCartVisible(!isCartVisible);
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
      <>
        <Navbar2 />
        <div className="flex items-center justify-center h-screen">
          <div className="p-8 bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-gray-700">{error}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar2 />
      <div className="flex bg-gray-100 min-h-screen text-black">
        {/* Cart Sidebar */}
        {isCartVisible && (
          <div className="w-80 bg-white shadow-lg p-4 overflow-y-auto fixed left-0 top-0 h-full z-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Approved Items</h2>
              <button
                onClick={toggleCartVisibility}
                className="text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <FaArrowLeft size={20} />
              </button>
            </div>
            {approvedUsers.length === 0 ? (
              <p className="text-gray-600">No items in the cart.</p>
            ) : (
              <div className="space-y-4">
                {approvedUsers.map((item) => (
                  <div key={item.userId} className="flex items-center">
                    <img
                      src={item.photo || "/default-profile.png"}
                      alt={item.name || "User"}
                      className="w-12 h-12 object-cover mr-3 rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Height: {item.tall}
                      </p>
                      <p className="text-sm text-gray-600">
                        Bicep: {item.biceps}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.userId)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Submit List Button */}
            {approvedUsers.length > 0 && (
              <button
                onClick={handleSubmitList}
                className="mt-4 w-full bg-yellow-500 text-white py-2 rounded-full hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-300 flex items-center justify-center"
              >
                <FaWhatsapp className="mr-2" /> Submit List
              </button>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4">
  {userDataList.length === 0 ? (
    <p className="text-gray-600">No submissions available.</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {userDataList.map((user) => (
        <div
          key={user.userId}
          className="bg-white border rounded-lg shadow-lg overflow-hidden flex flex-row sm:flex-col transition-transform duration-300 hover:scale-105"
        >
          <div className="w-1/3 sm:w-full h-56">
            <Link href={`/profile?userId=${user.userId}`}>
              <div className="w-full h-full bg-gray-100 overflow-hidden">
                <img
                  src={user.photo || "/default-profile.png"}
                  alt={user.name || "User"}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </Link>
          </div>

          <div className="w-[20vw] sm:w-full h-full   flex flex-col p-4">
            <Link href={`/profile?userId=${user.userId}`}>
              <h2 className="text-xl  truncate w-32 font-semibold text-gray-800 mb-2">
                {user.name || "N/A"}
              </h2>
            </Link>

            <div className="flex flex-wrap text-sm text-gray-700 mb-4">
              <div className=" truncate w-32">
                <span className="font-medium ">Height:</span>{" "}
                {user.tall || "N/A"}
              </div>
              <div className="truncate w-32">
                <span className="font-medium ">Bicep:</span>{" "}
                {user.biceps || "N/A"}
              </div>
              <div className="w-full">
                <span className="font-medium">Experience:</span>{" "}
                {user.exp || "N/A"} Years
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleApprove(user.userId)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full focus:outline-none focus:ring-2 transition-transform duration-300 ${
                    approvedItemIds.includes(user.userId)
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500"
                  }`}
                  title="Approve"
                  disabled={approvedItemIds.includes(user.userId)}
                >
                  <FaCheck />{" "}
                  {approvedItemIds.includes(user.userId)
                    ? "Approved"
                    : "Approve"}
                </button>

                <button
                  onClick={() => handleReject(user.userId)}
                  className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-transform duration-300"
                  title="Reject"
                >
                  <FaTrash /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

      </div>
      <Footer />
    </>
  );
};

export default ShowSubmissionAndUserData;
