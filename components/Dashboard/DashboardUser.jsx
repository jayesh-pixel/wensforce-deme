// pages/profile/[id].js

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";
import Navbar2 from "@/components/Navbar2";
import { FaEdit, FaSave, FaTimes, FaArrowLeft } from "react-icons/fa"; // Imported FaArrowLeft
import { AuthContext } from "@/context/AuthContext";
import { decryptId } from "@/utils/encryption";
import { toast } from "react-toastify";
import Link from "next/link";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/Firebase"; // Ensure this is the correct path to your Firebase config

export default function ProfilePage({ id,setId }) {
  const router = useRouter();
  // const { id } = router.query;

  const [service, setService] = useState(null);
  const { isDashboardAdmin } = useContext(AuthContext);

  const phoneNumber = id ? decryptId(id) : null;

  const isOwner = isDashboardAdmin;

  useEffect(() => {
    if (phoneNumber) {
      const userRef = doc(db, "users", phoneNumber);
      getDoc(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setService(snapshot.data());
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [phoneNumber]);

  if (!service) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar2 />
        {/* Back Button when service is not loaded */}
        <div className="container mx-auto px-4 py-2">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-500 hover:text-blue-700"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
        </div>
        <main className="flex-grow flex items-center justify-center">
          <p className="text-xl">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Function to handle saving field data
  const handleFieldSave = (field, newValue) => {
    const userDocRef = doc(db, "users", phoneNumber);
    let updates = {};

    updates[field] = newValue;

    updateDoc(userDocRef, updates)
      .then(() => {
        setService((prevService) => ({
          ...prevService,
          [field]: newValue,
        }));
        toast.success(`${field} updated successfully!`);
      })
      .catch((error) => {
        console.error(error);
        toast.error(`Failed to update ${field}`);
      });
  };

  return (
    <div className="flex text-black flex-col min-h-screen bg-gray-50 relative">
   

      {/* Back Button */}
      <div className="container mx-auto px-4 py-2">
        <button
          onClick={() => setId(null)}
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
      </div>

      {/* Main Content with Conditional Blur */}
      <main
        className={`flex-grow transition filter ${
          !isDashboardAdmin ? "blur-sm pointer-events-none" : "blur-0"
        }`}
      >
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 ">
          <div className="container mx-auto">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col lg:flex-row">
              {/* Left Section: Images */}
              <div className="p-6 lg:p-10 w-full lg:w-1/2 flex flex-col">
                {/* Main Profile Image */}
                <div className="relative flex items-center justify-center">
                  <img
                    src={service.photo || "/default-profile.png"}
                    alt="Profile Picture"
                    className="rounded-lg w-full h-64 sm:h-80 md:h-96 lg:h-[45vh]"
                  />
                </div>
              </div>

              {/* Right Section: Profile Details */}
              <div className="w-full lg:w-1/2 p-6 lg:p-12">
                <EditableField
                  label="Name"
                  value={service.name || "N/A"}
                  onSave={(newValue) => handleFieldSave("name", newValue)}
                  isOwner={isOwner}
                />
                <EditableField
                  label="Job Category"
                  value={service.categories || "N/A"}
                  onSave={(newValue) => handleFieldSave("categories", newValue)}
                  isOwner={isOwner}
                />
                <EditableField
                  label="Location"
                  value={
                    `${service.currentLocation?.city || "N/A"}, ${
                      service.currentLocation?.state || "N/A"
                    }` || "N/A"
                  }
                  onSave={(newValue) => {
                    const [city, state] = newValue.split(", ");
                    handleFieldSave("currentLocation", {
                      ...service.currentLocation,
                      city,
                      state,
                    });
                  }}
                  isOwner={isOwner}
                />
                <EditableField
                  label="Job Experience"
                  value={
                    service.experience ? `${service.experience} years` : "N/A"
                  }
                  onSave={(newValue) =>
                    handleFieldSave("experience", newValue)
                  }
                  isOwner={isOwner}
                />
                <EditableField
                  label="App Salary"
                  value={service.salary ? `${service.salary}` : "N/A"}
                  onSave={(newValue) => handleFieldSave("salary", newValue)}
                  isOwner={isOwner}
                />
                <EditableField
                  label="Main Salary"
                  value={
                    service.mainSalary ? `₹ ${service.mainSalary}` : "N/A"
                  }
                  onSave={(newValue) =>
                    handleFieldSave("mainSalary", newValue)
                  }
                  isOwner={isOwner}
                />

                {/* Body Details */}
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Body Details
                  </h4>
                  <div className="space-y-2 text-gray-700">
                    <EditableField
                      label="Height"
                      value={service.tall || "N/A"}
                      onSave={(newValue) => handleFieldSave("tall", newValue)}
                      isOwner={isOwner}
                    />
                    <EditableField
                      label="Weight"
                      value={service.kg || "N/A"}
                      onSave={(newValue) => handleFieldSave("kg", newValue)}
                      isOwner={isOwner}
                    />
                    <EditableField
                      label="Chest Size"
                      value={service.chest || "N/A"}
                      onSave={(newValue) => handleFieldSave("chest", newValue)}
                      isOwner={isOwner}
                    />
                    <EditableField
                      label="Biceps Size"
                      value={service.biceps || "N/A"}
                      onSave={(newValue) =>
                        handleFieldSave("biceps", newValue)
                      }
                      isOwner={isOwner}
                    />
                    <EditableField
                      label="Triceps Size"
                      value={service.triceps || "N/A"}
                      onSave={(newValue) =>
                        handleFieldSave("triceps", newValue)
                      }
                      isOwner={isOwner}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Sections */}
            <div className="mt-12 pb-12">
              <div className="container mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Information Card */}
                  <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <h2 className="text-2xl font-semibold text-gray-800">
                        Personal Information
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <EditableField
                        label="Date of Birth"
                        value={
                          service.dob
                            ? new Date(service.dob).toLocaleDateString()
                            : "N/A"
                        }
                        onSave={(newValue) => handleFieldSave("dob", newValue)}
                        isOwner={isOwner}
                      />
                      <EditableField
                        label="Gender"
                        value={service.gender || "N/A"}
                        onSave={(newValue) =>
                          handleFieldSave("gender", newValue)
                        }
                        isOwner={isOwner}
                      />
                      <EditableField
                        label="Beard"
                        value={service.beard || "N/A"}
                        onSave={(newValue) =>
                          handleFieldSave("beard", newValue)
                        }
                        isOwner={isOwner}
                      />
                      <EditableField
                        label="Hair"
                        value={service.hair || "N/A"}
                        onSave={(newValue) => handleFieldSave("hair", newValue)}
                        isOwner={isOwner}
                      />
                    </div>
                  </div>

                  {/* Skills Card */}
                  <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <h2 className="text-2xl font-semibold text-gray-800">
                        Skills
                      </h2>
                    </div>
                    {service.skills && service.skills.length > 0 ? (
                      <div className="space-y-2 text-gray-600">
                        {service.skills.map((skill, index) => (
                          <EditableField
                            key={index}
                            label={`Skill ${index + 1}`}
                            value={skill}
                            onSave={(newValue) => {
                              const newSkills = [...service.skills];
                              newSkills[index] = newValue;
                              handleFieldSave("skills", newSkills);
                            }}
                            isOwner={isOwner}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">N/A</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Overlay for Unauthenticated Users */}
      {!isDashboardAdmin && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p className="mb-6">
              You need to be logged in to view this profile. Please log in to
              continue.
            </p>
            <Link
              href="/"
              className="inline-block bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition duration-300"
            >
              Go to Home
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// EditableField Component
const EditableField = ({ label, value, onSave, isOwner }) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    setEditing(false);
    if (editValue !== value) {
      onSave(editValue);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditValue(value);
  };

  return (
    <div className="flex items-center my-2">
      <strong className="w-32">{label}:</strong>
      {editing ? (
        <>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 ml-2 p-1 border border-gray-300 rounded bg-white"
          />
          <button onClick={handleSave} className="ml-2 text-green-500">
            <FaSave size={16} />
          </button>
          <button onClick={handleCancel} className="ml-2 text-red-500">
            <FaTimes size={16} />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 ml-2">{value || "N/A"}</span>
          {isOwner && (
            <button
              onClick={() => setEditing(true)}
              className="ml-2 text-blue-500"
            >
              <FaEdit size={16} />
            </button>
          )}
        </>
      )}
    </div>
  );
};
