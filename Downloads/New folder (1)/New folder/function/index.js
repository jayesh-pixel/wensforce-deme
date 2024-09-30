import { Timestamp } from "firebase/firestore";
import { ReadDashBoard } from "../database/read.js";

async function getEntryFromDashboard() {
  try {
      const data = await ReadDashBoard('set');
      return data?.entry  ?? 150; // Default to 150 if data or entry is undefined
  } catch (error) {
      console.error("Error fetching entry from dashboard:", error);
      return 150; // Default to 150 in case of an error
  }
}
async function getMaxspotFromDashboard() {
  try {
      const data = await ReadDashBoard('set');
      return data?.maxspot ?? 100; // Default to 100 if data or maxspot is undefined
  } catch (error) {
      console.error("Error fetching maxspot from dashboard:", error);
      return 100; // Default to 100 in case of an error
  }
}
async function getPrizePoolFromDashboard() {
  try {
      const data = await ReadDashBoard('set');
      return data?. prizepool  ?? 10000; // Default to 10000 if data or prizepool is undefined
  } catch (error) {
      console.error("Error fetching  prizepool from dashboard:", error);
      return 10000; // Default to  10000 in case of an error
  }
}
function processData(data) {
    const result = {};
    const slotFrequency = {};
    const userSlotFrequency = {}; // Track user frequency for each slot
  
    data.forEach((item) => {
        const { userId, amount, values, time } = item;
        const valuesString = JSON.stringify(values); // Convert values to string for easier comparison
        const timestamp = new Date(time.seconds * 1000); // Convert timestamp to Date object
  
        // Initialize the user's data if it doesn't exist
        if (!result[userId]) {
            result[userId] = {
                slotvalues: [],
                time: [],
                totalamount: 0
            };
        }
  
        // Add slot values and time for the user
        result[userId].slotvalues.push(values);
        result[userId].time.push(timestamp); // Store time for comparison
        result[userId].totalamount += amount; // Sum up the amount
  
        // Count frequency of slot value combinations and store the earliest time
        if (!slotFrequency[valuesString]) {
            slotFrequency[valuesString] = { count: 0, userIds: new Set(), earliestTime: timestamp };
        }
        slotFrequency[valuesString].count += 1;
        slotFrequency[valuesString].userIds.add(userId);
  
        // Track user frequency for each slot value
        if (!userSlotFrequency[valuesString]) {
            userSlotFrequency[valuesString] = {};
        }
        if (!userSlotFrequency[valuesString][userId]) {
            userSlotFrequency[valuesString][userId] = 0;
        }
        userSlotFrequency[valuesString][userId] += 1;
  
        // Update earliest time if the current timestamp is earlier
        if (timestamp < slotFrequency[valuesString].earliestTime) {
            slotFrequency[valuesString].earliestTime = timestamp;
        }
    });
  
    // Prepare result for displaying unique slot values and their frequency
    const uniqueSlotValues = Object.keys(slotFrequency).map((key) => ({
        slotValues: JSON.parse(key),
        frequency: slotFrequency[key].count,
        userIds: Array.from(slotFrequency[key].userIds),
        earliestTime: slotFrequency[key].earliestTime,
        userDetails: Object.entries(userSlotFrequency[key]).map(([userId, count]) => ({ userId, count }))
    }));
  
    // Sort the unique slot values first by frequency in ascending order, and then by earliest time
    uniqueSlotValues.sort((a, b) => {
        if (a.frequency === b.frequency) {
            return a.earliestTime - b.earliestTime; // Sort by time if frequencies are the same
        }
        return a.frequency - b.frequency; // Sort by frequency first
    });
  
    // Merge user IDs for identical frequencies and slot values
    const mergedSlotValues = [];
    uniqueSlotValues.forEach((currentSlot) => {
        // Check if the last item has the same slot values and frequency
        const lastSlot = mergedSlotValues[mergedSlotValues.length - 1];
        if (
            lastSlot &&
            JSON.stringify(lastSlot.slotValues) === JSON.stringify(currentSlot.slotValues) &&
            lastSlot.frequency === currentSlot.frequency
        ) {
            // Merge user IDs and details
            lastSlot.userIds = Array.from(new Set([...lastSlot.userIds, ...currentSlot.userIds]));
            currentSlot.userDetails.forEach(({ userId, count }) => {
                const existing = lastSlot.userDetails.find(detail => detail.userId === userId);
                if (existing) {
                    existing.count += count;
                } else {
                    lastSlot.userDetails.push({ userId, count });
                }
            });
        } else {
            mergedSlotValues.push(currentSlot);
        }
    });
  
    return { result, mergedSlotValues };
  }
  
  // Function to generate all 5-digit combinations using digits 0-9
  function generateAllPermutations(maxCount) {
  const allPermutations = [];
  
  // Generate all combinations with repetition allowed
  for (let a = 0; a < 10; a++) {
    for (let b = 0; b < 10; b++) {
      for (let c = 0; c < 10; c++) {
        for (let d = 0; d < 10; d++) {
          for (let e = 0; e < 10; e++) {
            allPermutations.push([a, b, c, d, e]);
            if (allPermutations.length >= maxCount) {
              return allPermutations; // Stop when we reach maxCount
            }
          }
        }
      }
    }
  }
  
  return allPermutations;
  }
  
  function generatePermutationsOfInput(inputList) {
  const result = []; // Initialize result as an array
  function permute(arr, l, r) {
    if (l === r) {
      result.push([...arr]); // Push a copy of the array
    } else {
      for (let i = l; i <= r; i++) {
        [arr[l], arr[i]] = [arr[i], arr[l]]; // Swap
        permute(arr, l + 1, r); // Recurse
        [arr[l], arr[i]] = [arr[i], arr[l]]; // Swap back
      }
    }
  }
  
  permute(inputList, 0, inputList.length - 1);
  return Array.from(new Set(result.map(JSON.stringify))).map(JSON.parse); // Unique permutations
  }
  
  // Function to compute match count with the initial list
  function computeMatchCount(perm, initialList) {
  let count = 0;
  for (let i = 0; i < initialList.length; i++) {
    if (perm[i] === initialList[i]) {
      count++;
    }
  }
  return count;
  }
  
  // Function to compute sequence score based on how many digits match in sequence
  function computeSequenceScore(perm, initialList) {
  let score = 0;
  for (let i = 0; i < initialList.length; i++) {
    if (perm[i] === initialList[i]) {
      score++; // Increment score for every match in the same position
    } else {
      break; // Stop counting if the sequence breaks
    }
  }
  return score;
  }
  
  // Function to find the index of a specific list in the main list of all combinations
  function findIndexOfList(mainList, searchList) {
  return mainList.findIndex(perm => JSON.stringify(perm) === JSON.stringify(searchList));
  }
  
  // Main function to store permutations step by step (sorted by match count and sequence)
  function storePermutationsByMatchCount(initialList, maxCount) {
  const allPermutations = generateAllPermutations(maxCount);
  const stepByStepStorage = {
    match5: [],
    match4: [],
    match3: [],
    match2: [],
    match1: [],
    match0: [],
  };
  
  // First, store all unique permutations of the input list in match5 (exact match)
  const inputPermutations = generatePermutationsOfInput(initialList);
  inputPermutations.forEach((perm) => {
    stepByStepStorage.match5.push(perm);
  });
  
  const uniquePermutationsSet = new Set(inputPermutations.map(JSON.stringify)); // Store permutations in match5
  
  // Now, iterate over all permutations and classify based on match count
  allPermutations.forEach((perm) => {
    const matchCount = computeMatchCount(perm, initialList);
  
    // Store based on match count, but skip if already in match5
    if (uniquePermutationsSet.has(JSON.stringify(perm))) {
      return; // Skip if it's already in match5
    } else {
      uniquePermutationsSet.add(JSON.stringify(perm)); // Add to set to ensure uniqueness
    }
  
    if (matchCount === 4) {
      stepByStepStorage.match4.push(perm);
    } else if (matchCount === 3) {
      stepByStepStorage.match3.push(perm);
    } else if (matchCount === 2) {
      stepByStepStorage.match2.push(perm);
    } else if (matchCount === 1) {
      stepByStepStorage.match1.push(perm);
    } else {
      stepByStepStorage.match0.push(perm);
    }
  });
  
  // Sort each match category by sequence score in descending order
  Object.keys(stepByStepStorage).forEach(key => {
    stepByStepStorage[key].sort((a, b) => {
      const scoreA = computeSequenceScore(a, initialList);
      const scoreB = computeSequenceScore(b, initialList);
      return scoreB - scoreA; // Descending order by sequence score
    });
  });
  
  return stepByStepStorage;
  }
  
  
  // Function to display permutations in the format you want (e.g., "9,9,9,9,9")
  function displayPermutations(permutations, matchCount) {
  console.log(`\nMatch Count: ${matchCount}, length: ${permutations.length}`);
  permutations.forEach(perm => console.log(perm.join(',')));
  }
  
  
  
  
 async function AssignRanksToUsers(data) {
  
    
  const flitterdata = processData(data);
  
  // Display the user data
  console.table(flitterdata.result);
  flitterdata.mergedSlotValues.forEach(item => {
    console.log(item);
  });
  // Log the length of mergedSlotValues
  console.log('Total unique slot values:', flitterdata.mergedSlotValues.length);
  
  // Display the first item in mergedSlotValues
  if (flitterdata.mergedSlotValues.length > 0) {
    console.log('First item in mergedSlotValues:', flitterdata.mergedSlotValues[0]);
  } else {
    console.log('No items in mergedSlotValues.');
  }
    // Example: User inputs any initial list
  const initialList = flitterdata.mergedSlotValues[0].slotValues; // Change this list to any other 5-digit list
  
  // Store permutations step by step (sorted)
  const maxCount = 100000;
  const result = storePermutationsByMatchCount(initialList, maxCount);
  const allPermutations = result.match5.concat(
    result.match4,
    result.match3,
    result.match2,
    result.match1,
    result.match0
  );
  // Output the results for each match count
  console.log(`Total unique permutations: ${result.match5.length + result.match4.length + result.match3.length + result.match2.length + result.match1.length + result.match0.length}`);
  
  // Example of finding the index of a specific list in the main list of all permutations
  // const searchList = [8,8,8,8,8]; // Search for this list
  // const index = findIndexOfList(result.match5.concat(result.match4, result.match3, result.match2, result.match1, result.match0), searchList);
  // console.log(`Index of permutation [${searchList.join(',')}]: ${index}`);
  
  // Output the results for each match count in the desired format
  // displayPermutations(result.match5, 5);
  // displayPermutations(result.match4, 4);
  // displayPermutations(result.match3, 3);
  // displayPermutations(result.match2, 2);
  // displayPermutations(result.match1, 1);
  // displayPermutations(result.match0, 0);
  const userRanks = data.map(user => {
    const values = user.values;
    const index = findIndexOfList(allPermutations, values);
    return {
      userId: user.userId,
      values: values,
      index: index,
      rank: index >= 0 ? index + 1 : null // Assign rank based on index (1-based)
    };
  });
  
  // Group users by their values and assign the same rank to those with identical values
  const rankMap = new Map();
  userRanks.forEach(user => {
    const key = JSON.stringify(user.values); // Use values as the key
    if (!rankMap.has(key)) {
      rankMap.set(key, user.rank);
    }
    user.rank = rankMap.get(key); // Assign rank from the map
  });
  
  // Create a structured object for ranks
  const rankStructure = {};
  
  userRanks.forEach(user => {
    const rankKey = user.rank !== null ? user.rank : "unranked"; // Handle unranked users
    if (!rankStructure[rankKey]) {
      rankStructure[rankKey] = []; // Initialize array if it doesn't exist
    }
    rankStructure[rankKey].push(user); // Add user data to the appropriate rank
  });
  
  // Create a new object with ascending rank keys starting from 1
  const sortedRanks = {};
  let rankCounter = 1;
  
  Object.keys(rankStructure)
    .sort((a, b) => a - b) // Sort keys numerically
    .forEach(rank => {
      if (rank !== "unranked") { // Skip unranked users if needed
        sortedRanks[`rank${rankCounter}`] = rankStructure[rank];
        rankCounter++;
      }
    });


  // Step 1: Flatten the structure to create a single array of objects
  const allEntries = [];
  for (const key in sortedRanks) {
    sortedRanks[key].forEach(entry => {
      allEntries.push(entry);
    });
  }
  
  // Step 2: Sort the entries based on `values[0]` in ascending order
  const sortedEntries = allEntries.sort((a, b) => a.values[0] - b.values[0]);
  
  // Step 3: Assign ranks based on the sorted order
  const rankedData = {};
  sortedEntries.forEach((entry, index) => {
    rankedData[index + 1] = {
      ...entry,
      rank: index + 1
    };
  });
  const prizepool = await getPrizePoolFromDashboard();
  const maxspot = await getMaxspotFromDashboard();
  const entry = await getEntryFromDashboard();
  const filteredDistribution =distributePrize(maxspot,prizepool,entry);
  const rankedDataWithPrizes = assignPrizesToRankedData(rankedData, filteredDistribution);
  return {sortedRanks,rankedData,rankedDataWithPrizes};
  }
  function distributePrize(maxUsers, prizePool, entryFee) {
    // Ensure there are at least 20 users for valid distribution
    if (maxUsers < 20) {
      return []; // Return an empty array if the condition is not met
    }
  
    // Predefined distribution for top ranks
    let distribution = [];
  
    // Rank 1, 2, 3 distribution
    distribution.push({ rank: "1", prize: prizePool * 0.20 }); // 20%
    distribution.push({ rank: "2", prize: prizePool * 0.15 }); // 15%
    distribution.push({ rank: "3", prize: prizePool * 0.10 }); // 10%
  
    // Rank 4-5 (5% each, 10% total)
    const rank4_5Prize = prizePool * 0.05;
    for (let rank = 4; rank <= 5; rank++) {
      distribution.push({ rank: rank.toString(), prize: rank4_5Prize });
    }
  
    // Rank 6-10 (2.4% each, 12% total)
    const rank6_10Prize = prizePool * 0.024;
    for (let rank = 6; rank <= 10; rank++) {
      distribution.push({ rank: rank.toString(), prize: rank6_10Prize });
    }
  
    // Rank 11-20 (1.6% each, 16% total)
    const rank11_20Prize = prizePool * 0.018;
    for (let rank = 11; rank <= 20; rank++) {
      distribution.push({ rank: rank.toString(), prize: rank11_20Prize });
    }
  
    // Calculate remaining prize pool after top 20 ranks
    const allocatedPrize = distribution.reduce((total, entry) => total + entry.prize, 0);
    let remainingPrizePool = prizePool - allocatedPrize;
  
    // Calculate remaining winners after rank 20
    let remainingWinners = maxUsers - 20;
  
    // Ensure the remaining prize pool is distributed evenly with a gradual decreasing pattern
    if (remainingWinners > 0) {
      let rankGroup = 21;
      const groupSize = 10; // Each group will have 10 ranks
      let reductionFactor = 1.0; // Start with no reduction initially
  
      // Loop through the remaining ranks and allocate the remaining prize pool
      while (remainingWinners > 0 && remainingPrizePool > 0) {
        const currentGroupSize = Math.min(remainingWinners, groupSize);
  
        // Allocate a portion of the remaining prize pool to the current group
        const groupPrizePool = (remainingPrizePool * reductionFactor) / (1 + reductionFactor);
        let prizePerRank = currentGroupSize > 0 ? groupPrizePool / currentGroupSize : 0;
  
        // Stop the distribution if the prize per rank is below the entry fee
        if (prizePerRank < entryFee) {
          break; // Stop the distribution if no valid prize can be allocated
        }
  
        // Assign the prize for each rank in the group
        for (let i = 0; i < currentGroupSize; i++) {
          if (remainingPrizePool <= 0) {
            break; // Stop if no funds are left
          }
          if (prizePerRank > remainingPrizePool) {
            prizePerRank = remainingPrizePool; // Assign remaining prize if less than calculated
          }
          distribution.push({ rank: rankGroup.toString(), prize: prizePerRank });
          remainingPrizePool -= prizePerRank;
          rankGroup++;
        }
  
        remainingWinners -= currentGroupSize;
        reductionFactor /= 1.5; // Reduce the next group's prize
      }
    }
  
    // Filter out ranks with prize less than entry fee
    const filteredDistribution = distribution.filter(entry => entry.prize >= entryFee);
  
    // Return the distribution as a list of objects
    return filteredDistribution;
  }

  // Assuming filteredDistribution is an array of objects with 'rank' and 'prize' properties
function assignPrizesToRankedData(rankedData, filteredDistribution) {
  // Convert filteredDistribution to a map for easier access by rank
  const prizeMap = {};
  filteredDistribution.forEach(entry => {
    prizeMap[entry.rank] = entry.prize;
  });
  // Add a custom indicator message for rank 0
  rankedData[0] = {
    time: Timestamp.now(),
    rank:0 
  };
  // Add prizes to rankedData based on rank
  Object.keys(rankedData).forEach(rank => {
    if (rank !== '0') { // Skip rank 0 since it's a custom indicator
      // If rank exists in prizeMap, assign the corresponding prize
      if (prizeMap[rank]) {
        rankedData[rank].prize = prizeMap[rank];
      } else {
        // If rank doesn't exist in filteredDistribution, set prize to 0
        rankedData[rank].prize = 0;
      }
    }
  });

  return rankedData;
}
  export {AssignRanksToUsers};