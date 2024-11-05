// /context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/Firebase';

// Create context
export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [experience, setExperience] = useState([]);
    const [preference, setPreference] = useState([]);
    const [protection, setProtection] = useState([]);  // Store titles in protection state
    const [reffer, setReffer] = useState([]);
    const [skill, setSkill] = useState([]);
    const [biceps, setBiceps] = useState([]);
    const [chest, setChest] = useState([]);
    const [height, setHeight] = useState([]);
    const [tricep, setTricep] = useState([]);
    const [weight, setWeight] = useState([]);

    // Function to fetch and set state for specific keys from the parent document
    const fetchCollectionData = async (parentDocId, key, setState, isTitleOnly = false) => {
        try {
            // Reference to the parent document: app/{parentDocId}
            const parentDocRef = doc(db, 'app', parentDocId);
            
            // Fetch the parent document
            const parentDocSnap = await getDoc(parentDocRef);
            
            if (parentDocSnap.exists()) {
                const parentData = parentDocSnap.data();
                
                // Check if the key exists in the parent document data
                if (parentData && parentData[key]) {
                    if (isTitleOnly) {
                        // Extract titles if specified and setState with titles only
                        const titles = parentData[key].map(item => item.title);
                        setState(titles);
                    } else {
                        // Set state with the list of document data
                        setState(parentData[key]);
                    }
                    console.log(`Fetched data for key '${key}' from app/${parentDocId}:`, parentData[key]);
                } else {
                    console.warn(`Key '${key}' does not exist in app/${parentDocId}`);
                }
            } else {
                console.warn(`Parent document app/${parentDocId} does not exist.`);
            }
        } catch (error) {
            console.error(`Error fetching data for key '${key}' from app/${parentDocId}:`, error);
        }
    };

    useEffect(() => {
        // Fetch data for each key and set state
        fetchCollectionData('categories', 'data', setCategories);
        fetchCollectionData('experience', 'data', setExperience);
        fetchCollectionData('preference', 'data', setPreference);
        fetchCollectionData('protection', 'data', setProtection, true);  // Fetch only titles for protection
        fetchCollectionData('reffer', 'data', setReffer);
        fetchCollectionData('skill', 'data', setSkill);
        fetchCollectionData('body', 'biceps', setBiceps);
        fetchCollectionData('body', 'chest', setChest);
        fetchCollectionData('body', 'height', setHeight);
        fetchCollectionData('body', 'tricep', setTricep);
        fetchCollectionData('body', 'weight', setWeight);
    }, []);

    return (
        <FilterContext.Provider
            value={{
                categories,
                experience,
                preference,
                protection, // This will now contain only titles
                reffer,
                skill,
                biceps,
                chest,
                height,
                tricep,
                weight,
            }}
        >
            {children}
        </FilterContext.Provider>
    );
};
