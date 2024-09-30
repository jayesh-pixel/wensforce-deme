// // Example data
// const data = [
//     // User 1
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user1',
//       time: { seconds: 1725964887, nanoseconds: 941770000 }
//     },
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user1',
//       time: { seconds: 1725964891, nanoseconds: 301808000 }
//     },
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user6',
//       time: { seconds: 1725964891, nanoseconds: 301808000 }
//     },
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user1',
//       time: { seconds: 1725965252, nanoseconds: 215075000 }
//     },
//     // User 2
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user2',
//       time: { seconds: 1725975081, nanoseconds: 166771000 }
//     },
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user2',
//       time: { seconds: 1725975155, nanoseconds: 75308000 }
//     },
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user2',
//       time: { seconds: 1725975158, nanoseconds: 937048000 }
//     },
//     // User 3
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user3',
//       time: { seconds: 1725964887, nanoseconds: 941770000 }
//     },
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user3',
//       time: { seconds: 1725964891, nanoseconds: 301808000 }
//     },
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user3',
//       time: { seconds: 1725965252, nanoseconds: 215075000 }
//     },
//     // User 4
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user4',
//       time: { seconds: 1725975081, nanoseconds: 166771000 }
//     },
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user4',
//       time: { seconds: 1725975155, nanoseconds: 75308000 }
//     },
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user4',
//       time: { seconds: 1725975158, nanoseconds: 937048000 }
//     },
//     // User 5
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user5',
//       time: { seconds: 1725975081, nanoseconds: 166771000 }
//     },
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user5',
//       time: { seconds: 1725975155, nanoseconds: 75308000 }
//     },
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 1],
//       userId: 'user5',
//       time: { seconds: 1725975158, nanoseconds: 937048000 }
//     },
//     // Additional User 6
//     {
//       amount: 100,
//       values: [0, 0, 0, 1, 0],
//       userId: 'user6',
//       time: { seconds: 1725980000, nanoseconds: 123456000 }
//     },
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user6',
//       time: { seconds: 1725983600, nanoseconds: 654321000 }
//     },
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user6',
//       time: { seconds: 1725987200, nanoseconds: 789012000 }
//     },
//     // Additional User 7
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user7',
//       time: { seconds: 1725990000, nanoseconds: 345678000 }
//     },
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user7',
//       time: { seconds: 1725993600, nanoseconds: 456789000 }
//     },
//     {
//       amount: 100,
//       values: [0, 0, 0, 0, 0],
//       userId: 'user7',
//       time: { seconds: 1725997200, nanoseconds: 567890000 }
//     }
//   ];

import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase/index.js";
import { AssignRanksToUsers } from "./function/index.js";
import { UpdateMegacontest } from "./database/update.js";

  
// function processData(data) {
//     const result = {};
//     const slotFrequency = {};
//     const userSlotFrequency = {}; // Track user frequency for each slot

//     data.forEach((item) => {
//         const { userId, amount, values, time } = item;
//         const valuesString = JSON.stringify(values); // Convert values to string for easier comparison
//         const timestamp = new Date(time.seconds * 1000); // Convert timestamp to Date object

//         // Initialize the user's data if it doesn't exist
//         if (!result[userId]) {
//             result[userId] = {
//                 slotvalues: [],
//                 time: [],
//                 totalamount: 0
//             };
//         }

//         // Add slot values and time for the user
//         result[userId].slotvalues.push(values);
//         result[userId].time.push(timestamp); // Store time for comparison
//         result[userId].totalamount += amount; // Sum up the amount

//         // Count frequency of slot value combinations and store the earliest time
//         if (!slotFrequency[valuesString]) {
//             slotFrequency[valuesString] = { count: 0, userIds: new Set(), earliestTime: timestamp };
//         }
//         slotFrequency[valuesString].count += 1;
//         slotFrequency[valuesString].userIds.add(userId);

//         // Track user frequency for each slot value
//         if (!userSlotFrequency[valuesString]) {
//             userSlotFrequency[valuesString] = {};
//         }
//         if (!userSlotFrequency[valuesString][userId]) {
//             userSlotFrequency[valuesString][userId] = 0;
//         }
//         userSlotFrequency[valuesString][userId] += 1;

//         // Update earliest time if the current timestamp is earlier
//         if (timestamp < slotFrequency[valuesString].earliestTime) {
//             slotFrequency[valuesString].earliestTime = timestamp;
//         }
//     });

//     // Prepare result for displaying unique slot values and their frequency
//     const uniqueSlotValues = Object.keys(slotFrequency).map((key) => ({
//         slotValues: JSON.parse(key),
//         frequency: slotFrequency[key].count,
//         userIds: Array.from(slotFrequency[key].userIds),
//         earliestTime: slotFrequency[key].earliestTime,
//         userDetails: Object.entries(userSlotFrequency[key]).map(([userId, count]) => ({ userId, count }))
//     }));

//     // Sort the unique slot values first by frequency in ascending order, and then by earliest time
//     uniqueSlotValues.sort((a, b) => {
//         if (a.frequency === b.frequency) {
//             return a.earliestTime - b.earliestTime; // Sort by time if frequencies are the same
//         }
//         return a.frequency - b.frequency; // Sort by frequency first
//     });

//     // Merge user IDs for identical frequencies and slot values
//     const mergedSlotValues = [];
//     uniqueSlotValues.forEach((currentSlot) => {
//         // Check if the last item has the same slot values and frequency
//         const lastSlot = mergedSlotValues[mergedSlotValues.length - 1];
//         if (
//             lastSlot &&
//             JSON.stringify(lastSlot.slotValues) === JSON.stringify(currentSlot.slotValues) &&
//             lastSlot.frequency === currentSlot.frequency
//         ) {
//             // Merge user IDs and details
//             lastSlot.userIds = Array.from(new Set([...lastSlot.userIds, ...currentSlot.userIds]));
//             currentSlot.userDetails.forEach(({ userId, count }) => {
//                 const existing = lastSlot.userDetails.find(detail => detail.userId === userId);
//                 if (existing) {
//                     existing.count += count;
//                 } else {
//                     lastSlot.userDetails.push({ userId, count });
//                 }
//             });
//         } else {
//             mergedSlotValues.push(currentSlot);
//         }
//     });

//     return { result, mergedSlotValues };
// }

// const flitterdata = processData(data);

// // Display the user data
// console.table(flitterdata.result);
// flitterdata.mergedSlotValues.forEach(item => {
//     console.log(item);
// });
// // Log the length of mergedSlotValues
// console.log('Total unique slot values:', flitterdata.mergedSlotValues.length);

// // Display the first item in mergedSlotValues
// if (flitterdata.mergedSlotValues.length > 0) {
//     console.log('First item in mergedSlotValues:', flitterdata.mergedSlotValues[0]);
// } else {
//     console.log('No items in mergedSlotValues.');
// }
// // Function to generate all 5-digit combinations using digits 0-9
// function generateAllPermutations(maxCount) {
//   const allPermutations = [];
  
//   // Generate all combinations with repetition allowed
//   for (let a = 0; a < 10; a++) {
//     for (let b = 0; b < 10; b++) {
//       for (let c = 0; c < 10; c++) {
//         for (let d = 0; d < 10; d++) {
//           for (let e = 0; e < 10; e++) {
//             allPermutations.push([a, b, c, d, e]);
//             if (allPermutations.length >= maxCount) {
//               return allPermutations; // Stop when we reach maxCount
//             }
//           }
//         }
//       }
//     }
//   }

//   return allPermutations;
// }

// function generatePermutationsOfInput(inputList) {
//   const result = []; // Initialize result as an array
//   function permute(arr, l, r) {
//     if (l === r) {
//       result.push([...arr]); // Push a copy of the array
//     } else {
//       for (let i = l; i <= r; i++) {
//         [arr[l], arr[i]] = [arr[i], arr[l]]; // Swap
//         permute(arr, l + 1, r); // Recurse
//         [arr[l], arr[i]] = [arr[i], arr[l]]; // Swap back
//       }
//     }
//   }

//   permute(inputList, 0, inputList.length - 1);
//   return Array.from(new Set(result.map(JSON.stringify))).map(JSON.parse); // Unique permutations
// }

// // Function to compute match count with the initial list
// function computeMatchCount(perm, initialList) {
//   let count = 0;
//   for (let i = 0; i < initialList.length; i++) {
//     if (perm[i] === initialList[i]) {
//       count++;
//     }
//   }
//   return count;
// }

// // Function to compute sequence score based on how many digits match in sequence
// function computeSequenceScore(perm, initialList) {
//   let score = 0;
//   for (let i = 0; i < initialList.length; i++) {
//     if (perm[i] === initialList[i]) {
//       score++; // Increment score for every match in the same position
//     } else {
//       break; // Stop counting if the sequence breaks
//     }
//   }
//   return score;
// }

// // Function to find the index of a specific list in the main list of all combinations
// function findIndexOfList(mainList, searchList) {
//   return mainList.findIndex(perm => JSON.stringify(perm) === JSON.stringify(searchList));
// }

// // Main function to store permutations step by step (sorted by match count and sequence)
// function storePermutationsByMatchCount(initialList, maxCount) {
//   const allPermutations = generateAllPermutations(maxCount);
//   const stepByStepStorage = {
//     match5: [],
//     match4: [],
//     match3: [],
//     match2: [],
//     match1: [],
//     match0: [],
//   };

//   // First, store all unique permutations of the input list in match5 (exact match)
//   const inputPermutations = generatePermutationsOfInput(initialList);
//   inputPermutations.forEach((perm) => {
//     stepByStepStorage.match5.push(perm);
//   });

//   const uniquePermutationsSet = new Set(inputPermutations.map(JSON.stringify)); // Store permutations in match5

//   // Now, iterate over all permutations and classify based on match count
//   allPermutations.forEach((perm) => {
//     const matchCount = computeMatchCount(perm, initialList);

//     // Store based on match count, but skip if already in match5
//     if (uniquePermutationsSet.has(JSON.stringify(perm))) {
//       return; // Skip if it's already in match5
//     } else {
//       uniquePermutationsSet.add(JSON.stringify(perm)); // Add to set to ensure uniqueness
//     }

//     if (matchCount === 4) {
//       stepByStepStorage.match4.push(perm);
//     } else if (matchCount === 3) {
//       stepByStepStorage.match3.push(perm);
//     } else if (matchCount === 2) {
//       stepByStepStorage.match2.push(perm);
//     } else if (matchCount === 1) {
//       stepByStepStorage.match1.push(perm);
//     } else {
//       stepByStepStorage.match0.push(perm);
//     }
//   });

//   // Sort each match category by sequence score in descending order
//   Object.keys(stepByStepStorage).forEach(key => {
//     stepByStepStorage[key].sort((a, b) => {
//       const scoreA = computeSequenceScore(a, initialList);
//       const scoreB = computeSequenceScore(b, initialList);
//       return scoreB - scoreA; // Descending order by sequence score
//     });
//   });

//   return stepByStepStorage;
// }


// // Function to display permutations in the format you want (e.g., "9,9,9,9,9")
// function displayPermutations(permutations, matchCount) {
//   console.log(`\nMatch Count: ${matchCount}, length: ${permutations.length}`);
//   permutations.forEach(perm => console.log(perm.join(',')));
// }

// // Example: User inputs any initial list
// const initialList = flitterdata.mergedSlotValues[0].slotValues; // Change this list to any other 5-digit list

// // Store permutations step by step (sorted)
// const maxCount = 100000;
// const result = storePermutationsByMatchCount(initialList, maxCount);

// // Output the results for each match count
// console.log(`Total unique permutations: ${result.match5.length + result.match4.length + result.match3.length + result.match2.length + result.match1.length + result.match0.length}`);

// // Example of finding the index of a specific list in the main list of all permutations
// // const searchList = [8,8,8,8,8]; // Search for this list
// // const index = findIndexOfList(result.match5.concat(result.match4, result.match3, result.match2, result.match1, result.match0), searchList);
// // console.log(`Index of permutation [${searchList.join(',')}]: ${index}`);

// // Output the results for each match count in the desired format
// // displayPermutations(result.match5, 5);
// // displayPermutations(result.match4, 4);
// // displayPermutations(result.match3, 3);
// // displayPermutations(result.match2, 2);
// // displayPermutations(result.match1, 1);
// // displayPermutations(result.match0, 0);
// function assignRanksToUsers(data, permutations) {
//   const allPermutations = permutations.match5.concat(
//     permutations.match4,
//     permutations.match3,
//     permutations.match2,
//     permutations.match1,
//     permutations.match0
//   );

//   const userRanks = data.map(user => {
//     const values = user.values;
//     const index = findIndexOfList(allPermutations, values);
//     return {
//       userId: user.userId,
//       values: values,
//       index: index,
//       rank: index >= 0 ? index + 1 : null // Assign rank based on index (1-based)
//     };
//   });

//   // Group users by their values and assign the same rank to those with identical values
//   const rankMap = new Map();
//   userRanks.forEach(user => {
//     const key = JSON.stringify(user.values); // Use values as the key
//     if (!rankMap.has(key)) {
//       rankMap.set(key, user.rank);
//     }
//     user.rank = rankMap.get(key); // Assign rank from the map
//   });

//   // Create a structured object for ranks
//   const rankStructure = {};

//   userRanks.forEach(user => {
//     const rankKey = user.rank !== null ? user.rank : "unranked"; // Handle unranked users
//     if (!rankStructure[rankKey]) {
//       rankStructure[rankKey] = []; // Initialize array if it doesn't exist
//     }
//     rankStructure[rankKey].push(user); // Add user data to the appropriate rank
//   });

//   // Create a new object with ascending rank keys starting from 1
//   const sortedRanks = {};
//   let rankCounter = 1;

//   Object.keys(rankStructure)
//     .sort((a, b) => a - b) // Sort keys numerically
//     .forEach(rank => {
//       if (rank !== "unranked") { // Skip unranked users if needed
//         sortedRanks[`rank${rankCounter}`] = rankStructure[rank];
//         rankCounter++;
//       }
//     });

//   return sortedRanks;
// }

// // Example usage
// const rankedUsers = assignRanksToUsers(data, result);

// console.log(rankedUsers);















// function distributeFullPrizePool(prizePool, distributionPercentage, maxSpot, rankGroups) {
//   // Calculate the total number of winners
//   const numberOfWinners = Math.floor(maxSpot * (distributionPercentage / 100));
//   let distributedPrizes = [];
  
//   // Track the total distributed amount
//   let totalDistributed = 0;

//   let currentRank = 1; // Start from the first rank

//   for (let group of rankGroups) {
//       let rankEnd = currentRank + group.rankRange - 1;  // Calculate end rank for this group
      
//       // If this group exceeds the number of winners, adjust the group to stop at the last winner
//       if (rankEnd > numberOfWinners) {
//           rankEnd = numberOfWinners;
//       }

//       // Calculate total prize for this group
//       const totalPrizeForGroup = (prizePool * group.percentagePerRank) / 100;
//       const prizePerWinnerInGroup = totalPrizeForGroup / group.rankRange;

//       // Distribute the prize for each rank in this group
//       for (let rank = currentRank; rank <= rankEnd; rank++) {
//           distributedPrizes.push({ rank: rank, prize: prizePerWinnerInGroup });
//           totalDistributed += prizePerWinnerInGroup;  // Update total distributed amount
//       }

//       // Move to the next group if current group ends before winners limit
//       currentRank = rankEnd + 1;

//       // If the current rank exceeds the total number of winners, break the loop
//       if (currentRank > numberOfWinners) {
//           break;
//       }
//   }

//   // If we haven't covered all winners, dynamically extend the ranks using the remaining prize pool
//   while (currentRank <= numberOfWinners) {
//       const remainingPrize = prizePool - totalDistributed;
//       const remainingWinners = numberOfWinners - currentRank + 1;

//       // Distribute remaining prize evenly among the rest of the winners
//       const prizePerWinner = remainingPrize / remainingWinners;
//       distributedPrizes.push({ rank: currentRank, prize: prizePerWinner });
//       totalDistributed += prizePerWinner;

//       currentRank++; // Move to the next rank
//   }

//   return distributedPrizes;
// }

// // Example usage
// const prizePool = 10000;  // Total prize pool
// const distributionPercentage = 50;  // 50% of users will be winners
// const maxSpot = 100;  // Total participants

// // Define the rank groups
// const rankGroups = [
//   { rankRange: 1, percentagePerRank: 20 },    // 1st rank gets 20%
//   { rankRange: 1, percentagePerRank: 15 },    // 2nd rank gets 15%
//   { rankRange: 1, percentagePerRank: 10 },    // 3rd rank gets 10%
//   { rankRange: 2, percentagePerRank: 5 },     // 4th-5th get 5% each
//   { rankRange: 5, percentagePerRank: 1 },     // 6th-10th get 1% each
//   { rankRange: 10, percentagePerRank: 0.5 },  // 11th-20th get 0.5% each
//   { rankRange: 10, percentagePerRank: 0.25 }, // 21st-30th get 0.25% each
//   { rankRange: 10, percentagePerRank: 0.125}, // 31st-40th get 0.125% each
//   { rankRange: 10, percentagePerRank: 0.0625 }, // 41st-50th get 0.0625% each
//   { rankRange: 10, percentagePerRank: 0.05 },  // 51st-60th get 0.05% each
//   { rankRange: 10, percentagePerRank: 0.04 },  // 61st-70th get 0.04% each
//   { rankRange: 10, percentagePerRank: 0.035 }, // 71st-80th get 0.035% each
//   { rankRange: 10, percentagePerRank: 0.03 },  // 81st-90th get 0.03% each
//   { rankRange: 10, percentagePerRank: 0.025 }, // 91st-100th get 0.025% each
//   { rankRange: 10, percentagePerRank: 0.02 },  // 101st-110th get 0.02% each
//   { rankRange: 10, percentagePerRank: 0.015 }, // 111th-120th get 0.015% each
//   { rankRange: 10, percentagePerRank: 0.01 },  // 121st-130th get 0.01% each
//   { rankRange: 10, percentagePerRank: 0.009 }, // 131st-140th get 0.009% each
//   { rankRange: 10, percentagePerRank: 0.008 }, // 141st-150th get 0.008% each
//   { rankRange: 10, percentagePerRank: 0.007 }, // 151st-160th get 0.007% each
//   { rankRange: 10, percentagePerRank: 0.006 }, // 161st-170th get 0.006% each
//   { rankRange: 10, percentagePerRank: 0.005 }, // 171st-180th get 0.005% each
//   { rankRange: 10, percentagePerRank: 0.004 }, // 181st-190th get 0.004% each
//   { rankRange: 10, percentagePerRank: 0.003 }, // 191st-200th get 0.003% each
//   { rankRange: 10, percentagePerRank: 0.0025}, // 201st-210th get 0.0025% each
// ];

// // Distribute prizes
// const result = distributeFullPrizePool(prizePool, distributionPercentage, maxSpot, rankGroups);

// // Calculate total prize distributed
// const totalPrizeDistributed = result.reduce((total, item) => total + item.prize, 0);

// // Log the result and total prize distributed
// console.log(result);
// console.log(`Total Prize Distributed: $${totalPrizeDistributed.toFixed(2)}`);

async function getSlotData(interval) {
  try {
      const slotDocRef = doc(db, 'slots', interval);
      const slotDocSnap = await getDoc(slotDocRef);

      if (slotDocSnap.exists()) {
          const slotData = slotDocSnap.data();
          
          // Log the raw slotData
          console.table(slotData);
          const objectList = [];
          const userobjectList = [];
          const slotAmount = [];

          Object.entries(slotData).forEach(([userId, item]) => {
              if (item.slots && item.data) {
                  item.slots.forEach((slot) => {
                      if (item.data[slot]) {
                          const slotItem = item.data[slot];
                          const { amount, period, key, type, values, time } = slotItem;
                          userobjectList.push({ amount,values,userId,time});
                          objectList.push({ amount, period, key, type, values });
                          slotAmount.push({ amount, values });
                      }
                  });
              }
          });

          // Log the objectList with the specified properties
          console.table(userobjectList);

          if (!Array.isArray(objectList)) {
              console.error('Error: objectList is not an array');
              return {};
          }

          const amountMap = {};
          objectList.forEach((slot) => {
              const { values, amount } = slot;
              if (Array.isArray(values) && typeof amount === 'number') {
                  const perValueAmount = amount / values.length;
                  values.forEach((value) => {
                      if (!amountMap[value]) {
                          amountMap[value] = { a: 0, n: 0 };
                      }
                      amountMap[value].a += perValueAmount;
                      amountMap[value].n += 1;
                  });
              }
          });

          const finalMap = {};
          for (let i = 0; i <= 9; i++) {
              if (!amountMap[i]) {
                  finalMap[i] = { a: 0, n: 0 };
              } else {
                  finalMap[i] = amountMap[i];
              }
          }

          // Return the final map and user-slot mapping
          return { finalMap,slotAmount,userobjectList,slotData};
      } else {
          console.log(`No slot document found for ${interval}.`);
          return {};
      }
  } catch (error) {
      console.error(`Error retrieving slot document for ${interval}:`, error);
      return {};
  }
}

async function emitRemainingTimeUntil9PM() {
  // Function to calculate and emit the remaining time
  function updateRemainingTime() {
      // Update the current time
      let currentTime = new Date();

      // Set or update the target time to 9 PM today
      let targetTime = new Date();
      targetTime.setHours(14,6, 0, 0); // 9:00 PM

      // If current time is past 9 PM, update the target to 9 PM tomorrow
      if (currentTime > targetTime) {
          targetTime.setDate(targetTime.getDate() + 1);
      }

      // Calculate the time difference in milliseconds
      let timeDifference = targetTime - currentTime;

      // Convert the time difference into hours, minutes, and seconds
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      // Emit the updated remaining time to all connected clients
      // io.emit('digi9pm', {
      //     hours: hours,
      //     minutes: minutes,
      //     seconds: seconds
      // });

      return { currentTime, targetTime, timeDifference }; // Return the updated values
  }

  // Initial call to set up the timer
  let { currentTime, targetTime, timeDifference } = updateRemainingTime();

  // Set up the interval to update every second
  const interval = setInterval(async () => {
      // Update currentTime, targetTime, and timeDifference with each interval
      ({ currentTime, targetTime, timeDifference } = updateRemainingTime());
      let processedData;
      // Ensure that timeDifference is updated accurately
      if (timeDifference <= 1000) {  // Allow a 1 second tolerance to ensure it triggers
          // Log that we have reached the end time
          console.log('Reached 9 PM, restarting the countdown for the next day.');

          // Function to fetch the latest slot data
          const { finalMap, slotAmount, userobjectList,slotData } = await getSlotData('megacontent');
          console.log(finalMap),
          console.log(slotAmount),
          console.log(userobjectList),
          processedData = (await AssignRanksToUsers(userobjectList)).rankedDataWithPrizes;
          console.log(processedData);
          UpdateMegacontest(processedData);
          try {
              //await clearSlotData('megacontent');  // Ensure this happens asynchronously
              console.log(`Cleared slot data for interval 'megacontent'`);
          } catch (error) {
              console.error(`Error clearing slot data for interval 'megacontent':`, error);
          }
          // Clear the interval to stop the current timer
          clearInterval(interval);

          // Trigger any additional action here (e.g., fetch new data, notify users)
          // For example: io.emit('endOfDay', { message: '9 PM reached' });

          // Restart the timer for the next 9 PM
          emitRemainingTimeUntil9PM();
      }
  }, 1000); // Update every second
}

// Call the function to start emitting remaining time
emitRemainingTimeUntil9PM();


// const processedData = AssignRanksToUsers(data).sortedRanks;
// console.log(processedData);


// function sortedRanks(processedData){
//   // Step 1: Flatten the structure to create a single array of objects
//   const allEntries = [];
//   for (const key in processedData) {
//     processedData[key].forEach(entry => {
//       allEntries.push(entry);
//     });
//   }
  
//   // Step 2: Sort the entries based on `values[0]` in ascending order
//   const sortedEntries = allEntries.sort((a, b) => a.values[0] - b.values[0]);
  
//   // Step 3: Assign ranks based on the sorted order
//   const rankedData = {};
//   sortedEntries.forEach((entry, index) => {
//     rankedData[index + 1] = {
//       ...entry,
//       rank: index + 1
//     };
//   });
//   return rankedData;
// }
  

  
//   // Step 4: Log the result to see the updated structure
//   const rankedData=sortedRanks(processedData);
//   console.log(rankedData);
  
  