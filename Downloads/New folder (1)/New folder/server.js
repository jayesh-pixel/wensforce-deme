
import express from 'express';
import { createServer, METHODS } from 'http';
import cors from 'cors';
import { db } from './firebase/index.js';
import { arrayUnion, updateDoc, setDoc, doc, getDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { Server as SocketServer } from 'socket.io';
import { UpdateDashBoard, updateJoinedSlotInFirestoreBtn, UpdateMegacontest, UpdateUser, Updatewinnigs } from './database/update.js';
import { ReadDashBoard, ReadUser } from './database/read.js';
import { sendNotification } from './notification/index.js';
import os from 'os';
import { AssignRanksToUsers } from './function/index.js';
const app = express();
const server = createServer(app);
const io = new SocketServer(server);
const corsConfig={
    origin:"*",
}
// Set up middleware
app.use(cors(corsConfig));
app.use(express.json());
const port = process.env.PORT || 8000;

const uidToSocketMap = new Map();
const getLocalIpAddress = () => {
    const interfaces = os.networkInterfaces(); // Get all network interfaces
    for (const iface in interfaces) {
        for (const details of interfaces[iface]) {
            // Look for IPv4 addresses that are not internal (non-loopback)
            if (details.family === 'IPv4' && !details.internal) {
                return details.address; // Return the external IP address
            }
        }
    }
    return 'localhost'; // Fallback if no external IP is found
};

const ipAddress = getLocalIpAddress();
if(ipAddress){
    // UpdateDashBoard({'server':`http://${ipAddress}:${port}`});
    console.log(`Your local IP address is: ${ipAddress}`);
}

function formatNumber(num, length) {
    return num.toString().padStart(length, '0');
}
function getCurrentDate() {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}

async function getPercentageFromDashboard() {
    try {
        const data = await ReadDashBoard('set');
        return data?.percentage * 0.01 ?? 0.8; // Default to 80% if data or percentage is undefined
    } catch (error) {
        console.error("Error fetching percentage from dashboard:", error);
        return 0.8; // Default to 80% in case of an error
    }
}

async function getExtraWallet() {
    try {
        const data = await ReadDashBoard('set');
        return data?.wallet ?? 0;
    } catch (error) {
        console.error("Error fetching wallet from dashboard:", error);
        return 0; // Default to 80% in case of an error
    }
}

async function getProfit() {
    try {
        const data = await ReadDashBoard('set');
        return data?.profit ?? 0;
    } catch (error) {
        console.error("Error fetching profit from dashboard:", error);
        return 0; // Default to 80% in case of an error
    }
}
async function getFilteredList(data, slotWithAmount) {
    if (!data || !slotWithAmount || Object.keys(data).length === 0 && slotWithAmount.length === 0) {
        const randomNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10));
        return { drawnNumbers: randomNumbers,results : {}};
    }
    const userTotalCollectedAmount=Object.values(data).reduce((sum, item) => sum + item.a, 0);
    // Calculate total collected amount and distribution amount
    const extrawallet=await getExtraWallet();
    const totalCollectedAmount = userTotalCollectedAmount + extrawallet;
    // Get percentage from Firestore
    const percentage = await getPercentageFromDashboard();
    const maxDistributionAmount = totalCollectedAmount * percentage;

    // Step 1: Sort numbers based on their occurrences (n) and bet amounts (a)
    const sortedNumbers = Object.entries(data)
        .sort(([, value1], [, value2]) => (value1.a - value2.a) || (value1.n - value2.n))
        .map(([key]) => parseInt(key, 10));

    // Memoization object to store already calculated winnings for drawn numbers
    const winningsCache = new Map();

    // Function to calculate total winnings with memoization
    function calculateTotalWinnings(drawnNumbers) {
        const key = drawnNumbers.join(',');
        if (winningsCache.has(key)) {
            return winningsCache.get(key);
        }
    
        let totalWinnings = 0;
        slotWithAmount.forEach(slot => {
            // Create frequency maps for drawn numbers and slot values
            const drawnFrequency = {};
            const slotFrequency = {};
    
            drawnNumbers.forEach(number => {
                drawnFrequency[number] = (drawnFrequency[number] || 0) + 1;
            });
    
            slot.values.forEach(number => {
                slotFrequency[number] = (slotFrequency[number] || 0) + 1;
            });
    
            // Calculate the number of matches based on the minimum frequency of each number
            let matches = 0;
            for (const number in slotFrequency) {
                if (drawnFrequency[number]) {
                    matches += Math.min(drawnFrequency[number], slotFrequency[number]);
                }
            }
    
            // Determine the multiplier based on the number of matches
            let multiplier = 0;
            switch (matches) {
                case 2:
                    multiplier = 10;
                    break;
                case 3:
                    multiplier = 150;
                    break;
                case 4:
                    multiplier = 200;
                    break;
                case 5:
                    multiplier = 250;
                    break;
            }
    
            totalWinnings += (slot.amount / 5) * multiplier;
        });
    
        winningsCache.set(key, totalWinnings);
        return totalWinnings;
    }
    

    // Function to generate combinations of drawn numbers with repetition
    function generateCombinationsWithRepetition(arr, size) {
        const result = [];
        function helper(path) {
            if (path.length === size) {
                result.push([...path]);
                return;
            }
            for (let i = 0; i < arr.length; i++) {
                path.push(arr[i]);
                helper(path);
                path.pop();
            }
        }
        helper([]);
        return result;
    }

    // Function to find the best valid combination of drawn numbers
    function findBestCombination() {
        let bestCombination = [];
        let closestWinAmount = 0;
        let minDifference = Infinity;

        // Generate combinations with repetition
        const combinations = generateCombinationsWithRepetition(sortedNumbers, 5);
        const validCombinations = [];

        combinations.forEach(combination => {
            const totalWinnings = calculateTotalWinnings(combination);
            if (totalWinnings <= maxDistributionAmount) {
                validCombinations.push({ combination, totalWinnings });
            }
        });

        if (validCombinations.length === 0) {
            console.log('No valid combination found that meets the criteria.');

            // Fallback logic to find a combination with repetition
            const fallbackCombination = sortedNumbers.slice(0, 5); // Basic fallback
            const fallbackTotalWinnings = calculateTotalWinnings(fallbackCombination);
            return { drawnNumbers: fallbackCombination, totalWinAmount: fallbackTotalWinnings };
        }

        validCombinations.forEach(({ combination, totalWinnings }) => {
            const difference = Math.abs(totalWinnings - maxDistributionAmount);
            if (difference < minDifference) {
                minDifference = difference;
                closestWinAmount = totalWinnings;
                bestCombination = combination;
            }
        });

        console.log('Best combination found:', bestCombination);
        console.log('Total Win Amount for best combination:', closestWinAmount);

        return { drawnNumbers: bestCombination, totalWinAmount: closestWinAmount };
    }

    // Get the best valid combination of drawn numbers
    const { drawnNumbers, totalWinAmount } = findBestCombination();

    if (drawnNumbers.length === 0) {
        // If no valid combination was found, return default values
        console.log('Returning default random numbers as no valid combination was found.');
        const randomNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10));
        return { drawnNumbers: randomNumbers, distribution: {} };
    }

    // Calculate final results based on adjusted drawn numbers
    // Calculate final results based on adjusted drawn numbers
const results = {};
slotWithAmount.forEach(slot => {
    // Create frequency maps for drawn numbers and slot values
    const drawnFrequency = {};
    const slotFrequency = {};

    drawnNumbers.forEach(number => {
        drawnFrequency[number] = (drawnFrequency[number] || 0) + 1;
    });

    slot.values.forEach(number => {
        slotFrequency[number] = (slotFrequency[number] || 0) + 1;
    });

    // Calculate the matched numbers based on the minimum frequency of each number
    const matchedNumbers = [];
    for (const number in slotFrequency) {
        if (drawnFrequency[number]) {
            const minMatches = Math.min(drawnFrequency[number], slotFrequency[number]);
            for (let i = 0; i < minMatches; i++) {
                matchedNumbers.push(parseInt(number, 10));
            }
        }
    }

    // Determine the multiplier based on the number of matches
    let multiplier = 0;
    switch (matchedNumbers.length) {
        case 2:
            multiplier = 10;
            break;
        case 3:
            multiplier = 150;
            break;
        case 4:
            multiplier = 200;
            break;
        case 5:
            multiplier = 250;
            break;
    }

    const winnings = (slot.amount / 5) * multiplier;
    results[slot.values.join(',')] = {
        matchedNumbers: matchedNumbers.join(','),
        winnings,
        amount: slot.amount,
        eachnumberamount: (slot.amount / 5),
        totalWinAmount
    };
});


    console.log('Amount:', '100%', totalCollectedAmount, `${(percentage)*100}%` , maxDistributionAmount, `${(1-percentage)*100}%`, totalCollectedAmount - maxDistributionAmount);
    console.log('Drawn Numbers:', drawnNumbers);
    console.log('Total Win Amount:', totalWinAmount);
    UpdateDashBoard({'wallet':(maxDistributionAmount-totalWinAmount)});
    const profit= await getProfit();
    UpdateDashBoard({'profit':(totalCollectedAmount - maxDistributionAmount)+profit});
    console.log('Results per slot:');
    console.table(results);
    
    return { drawnNumbers, results };
}
async function getSlotData(interval) {
    try {
        const slotDocRef = doc(db, 'slots', interval);
        const slotDocSnap = await getDoc(slotDocRef);

        if (slotDocSnap.exists()) {
            const slotData = slotDocSnap.data();
            console.table(slotData); // Log the raw slotData for debugging

            const objectList = [];
            const userobjectList = [];
            const slotAmount = [];
            const adsDataList = [];

            Object.entries(slotData).forEach(([userId, item]) => {
                if (item.slots && item.data) {
                    item.slots.forEach((slot) => {
                        if (item.data[slot]) {
                            const slotItem = item.data[slot];
                            const { amount, period, key, type, values, time, isAds } = slotItem;

                            // Check if isAds is true and store in a separate list
                            if (isAds) {
                                adsDataList.push({ userId, slotItem });
                            }

                            userobjectList.push({ amount, values, userId, time });
                            objectList.push({ amount, period, key, type, values });
                            slotAmount.push({ amount, values });
                        }
                    });
                }
            });

            console.table(userobjectList); // Log the userobjectList for debugging
            console.table(adsDataList); // Log only ads data for debugging

            if (!Array.isArray(objectList)) {
                console.error('Error: objectList is not an array');
                return {};
            }

            // Mapping amounts to values
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
                finalMap[i] = amountMap[i] || { a: 0, n: 0 };
            }

            // Return the final map and the filtered ads data
            return { finalMap, slotAmount, userobjectList, slotData, adsDataList };
        } else {
            console.log(`No slot document found for ${interval}.`);
            return {};
        }
    } catch (error) {
        console.error(`Error retrieving slot document for ${interval}:`, error);
        return {};
    }
}



function getPeriodKey(interval, minuteOffset = 0) {
    const now = new Date();
    const currentMinute = now.getHours() * 60 + now.getMinutes() + minuteOffset;
    const minutesPerDay = 1440;

    let periodsPerDay;
    switch (interval) {
        case '1min':
            periodsPerDay = 1440;
            break;
        case '3min':
            periodsPerDay = 480;
            break;
        case '15min':
            periodsPerDay = 96;
            break;
        default:
            throw new Error('Invalid interval');
    }

    const periodNumber = Math.floor(currentMinute / (minutesPerDay / periodsPerDay)) + 1;
    return `${getCurrentDate()}${formatNumber(periodNumber, interval === '15min' ? 2 : interval === '3min' ? 3 : 4)}`;
}
async function generateRandomData() {
    return Array.from({ length: 5 }, () => Math.floor(Math.random() * 10));
}
async function clearSlotData(interval) {
    try {
        const slotDocRef = doc(db, 'slots', interval);
        const slotDocSnap = await getDoc(slotDocRef);

        if (slotDocSnap.exists()) {
            await deleteDoc(slotDocRef);
            console.log(`Deleted slot document for ${interval}`);
        } else {
            console.log(`No slot document found for ${interval}, nothing to delete.`);
        }
    } catch (error) {
        console.error(`Error handling slot document for ${interval}:`, error);
    }
}


function calculateRemainingTime(nextPeriodStart,interval) {
    const now = new Date();
    const timeDifference = nextPeriodStart - now.getTime();
    const upcomingPeriodKey = getPeriodKey(interval, interval === '1min' ? 1 : interval === '3min' ? 3 : 15);
    return {
        minutes: Math.floor((timeDifference / 1000 / 60) % 60),
        seconds: Math.floor((timeDifference / 1000) % 60),
        upcomingPeriodKey,
    };
}
async function updatePeriod(interval, result) {
    try {
        const periodKey = getPeriodKey(interval);
        const upcomingPeriodKey = getPeriodKey(interval, interval === '1min' ? 1 : interval === '3min' ? 3 : 15);
        const periodDocRef = doc(db, "period", interval);
        const periodDocSnap = await getDoc(periodDocRef);

        if (periodDocSnap.exists()) {
            // Update the existing period with the new data
            await updateDoc(periodDocRef, {
                period: arrayUnion({
                    time: Timestamp.now(),
                    period: periodKey,
                    result: result  // Check this value
                }),
                upcomingperiod: upcomingPeriodKey
            });
        } else {
            // Create the document if it doesn't exist
            await setDoc(periodDocRef, {
                period: [{
                    time: Timestamp.now(),
                    period: periodKey,
                    result: result  // Check this value
                }],
                upcomingperiod: upcomingPeriodKey
            });
        }

        console.log(`Period ${interval} data updated successfully with result:`, result);
    } catch (error) {
        console.error(`Error updating ${interval} period:`, error);
    }
}

function scheduleNextUpdate(interval, delay) {
    const nextPeriodStart = Date.now() + delay;
    let resultList = null;
    let userList=null;
    let adsList=null;

    const timer = setInterval(async () => {
        const remainingTime = calculateRemainingTime(nextPeriodStart,interval);
        
        // Calculate distributed amounts based on different intervals
        if (interval === '1min' && remainingTime.minutes === 0 && remainingTime.seconds === 10) {
            const {result,userobjectList,adsDataList}=await handleDistributedAmounts(interval);
            resultList=result;
            userList=userobjectList;
            adsList=adsDataList;
        } else if (interval === '3min' && remainingTime.minutes === 0 && remainingTime.seconds === 15) {
            const {result,userobjectList,adsDataList}=await handleDistributedAmounts(interval);
            resultList=result;
            userList=userobjectList;
            adsList=adsDataList;
        } else if (interval === '15min' && remainingTime.minutes === 0 && remainingTime.seconds === 30) {
            const {result,userobjectList,adsDataList}=await handleDistributedAmounts(interval);
            resultList=result;
            userList=userobjectList;
            adsList=adsDataList;
        }

        // Clear slot data 1 second before the next period
        if (remainingTime.minutes === 0 && remainingTime.seconds === 0) {
            try {
                await clearSlotData(interval);  // Ensure this happens asynchronously
                console.log(`Cleared slot data for interval ${interval}`);
                if (adsList) {
                    const slotKeyCount = {}; // Map to track counts of unique (userId, type) pairs
                
                    // Use a for...of loop to handle async/await properly
                    for (const ad of adsList) {
                        const userId = ad.userId;
                        const slotItem = ad.slotItem;
                        const upcomingPeriodKey = getPeriodKey(slotItem.type, slotItem.type === '1min' ? 1 : slotItem.type === '3min' ? 3 : 15);
                        // Create a unique key based on userId and slotItem.type
                        const uniqueKey = `${userId}-${slotItem.type}`;
                
                        // Initialize the count if not already done
                        if (!slotKeyCount[uniqueKey]) {
                            slotKeyCount[uniqueKey] = 0;
                        }
                
                        // Increment the count for this userId and type
                        slotKeyCount[uniqueKey] += 1;
                
                        // Set the slotItem.key based on the count (slot1, slot2, etc.)
                        slotItem.key = `slot${slotKeyCount[uniqueKey]}`;
                
                        // Update isAds based on the value of upperiod
                        if (slotItem.upperiod > 2) {
                            slotItem.upperiod -= 1;
                            slotItem.time = Timestamp.now();
                            slotItem.isAds = true; // Set isAds to true if upperiod is >= 1
                            slotItem.period = upcomingPeriodKey;
                        } else {
                            slotItem.upperiod -= 1;
                            slotItem.time = Timestamp.now();
                            slotItem.period = upcomingPeriodKey;
                            slotItem.isAds = false; // Set isAds to false if upperiod is < 1
                        }
                
                        // Log the details of the slot item
                        console.log('User ID:', userId);
                        console.log('Slot Item:', slotItem);
                        
                        // Wait for the Firestore update to complete before proceeding to the next item
                        await updateJoinedSlotInFirestoreBtn(slotItem.key, slotItem, userId, slotItem.type);
                    }
                }
                
                
            } catch (error) {
                console.error(`Error clearing slot data for interval ${interval}:`, error);
            }
        }

        // Optionally emit remaining time to clients via Socket.io
        io.emit('timerUpdate', { interval, remainingTime});

        // Stop the timer when the countdown reaches zero
        if (remainingTime.minutes <= 0 && remainingTime.seconds <= 0) {
            clearInterval(timer);
        }
    }, 1000);  // Update the timer every second

    setTimeout(async () => {
        // Pass the stored result to updatePeriod
        if (resultList && !resultList.some(isNaN) && userList) {
            await updatePeriod(interval, resultList);  // Update the period after the delay
            const totalid=calculateTotalWinnings(userList,resultList);
            const result=resultList;
            io.emit('hello',{interval, result});
            console.log({interval, result});
            updateUserWinnings(totalid);
        } else {
            const randomResult = await generateRandomData();
            console.log('No valid result, adding random data to period.');
            const result=randomResult;
            io.emit('hello',{interval, result});
            console.log({interval, result});
            await updatePeriod(interval, randomResult);  // Update the period with random data
        }
        scheduleNextUpdate(interval, delay);  // Schedule the next update
    }, delay);
}
// Helper function to check if a userId is in the uidToSocketMap
function checkUserInMap(userId) {
    for (const [uid] of uidToSocketMap.entries()) {
        if (uid === userId) {
            return true;
        }
    }
    return false;
}
async function updateUserWinnings(totalid) {
    
    // Loop through each user and update their winnings
    for (const { userId, totalWinnings,totalBet } of totalid) {
        try {
            // Read user data
            const user = await ReadUser(userId);
            
            if (user) {
                // Assuming 'bal' is the field you want to update with new winnings
                const newBalance = user.bal + totalWinnings;
                UpdateUser({bal:newBalance},userId);
                Updatewinnigs([{ w: totalWinnings, time: Timestamp.now(),a:totalBet  }], userId);
                if(!checkUserInMap(userId) && totalWinnings!=0 && user && user.Token){
                    await sendNotification('win', `You Winning ${totalWinnings}`, user.userToken);
                    console.log('sending msg');
                }
                console.log(`Updated winnings for user ${userId}: ${totalWinnings}. New balance: ${newBalance}`);
            } else {
                console.error(`No user data found for ${userId}`);
            }
        } catch (error) {
            console.error(`Error updating winnings for user ${userId}:`, error);
        }
    }
}

function calculateTotalWinnings(userList, resultList) {
    // Create a map to store the total winnings for each user
    const userWinnings = new Map();

    // Create a map to store the total bets for each user
    const userBets = new Map();

    // Create a frequency map for drawn numbers
    const drawnFrequency = {};
    resultList.forEach(number => {
        drawnFrequency[number] = (drawnFrequency[number] || 0) + 1;
    });

    // Process each slot for the user
    userList.forEach(slot => {
        // Create a frequency map for slot values
        const slotFrequency = {};
        slot.values.forEach(number => {
            slotFrequency[number] = (slotFrequency[number] || 0) + 1;
        });

        // Calculate the number of matches based on the minimum frequency of each number
        let matches = 0;
        for (const number in slotFrequency) {
            if (drawnFrequency[number]) {
                matches += Math.min(drawnFrequency[number], slotFrequency[number]);
            }
        }

        // Determine the multiplier based on the number of matches
        let multiplier = 0;
        switch (matches) {
            case 2:
                multiplier = 10;
                break;
            case 3:
                multiplier = 150;
                break;
            case 4:
                multiplier = 200;
                break;
            case 5:
                multiplier = 250;
                break;
        }

        // Calculate winnings for the slot
        const winnings = (slot.amount / 5) * multiplier;

        // Update the total winnings and total bets for the user
        if (!userWinnings.has(slot.userId)) {
            userWinnings.set(slot.userId, 0);
            userBets.set(slot.userId, 0);
        }
        userWinnings.set(slot.userId, userWinnings.get(slot.userId) + winnings);
        userBets.set(slot.userId, userBets.get(slot.userId) + slot.amount);
    });

    // Return the total winnings and total bets for each user
    return Array.from(userWinnings.entries()).map(([userId, totalWinnings]) => ({
        userId,
        totalWinnings,
        totalBet: userBets.get(userId)
    }));
}

// Handle distributed amounts for different intervals
async function handleDistributedAmounts(interval) {
    const periodKey = getPeriodKey(interval);
    let result = null;
    let userobjectList = null;
    let adsDataList = null; // Correctly initialize adsDataList

    try {
        // Fetch slot data
        const { finalMap, slotAmount, userobjectList: fetchedUserobjectList, adsDataList: fetchedAdsDataList } = await getSlotData(interval);

        userobjectList = fetchedUserobjectList; // Assign fetched userobjectList
        adsDataList = fetchedAdsDataList;       // Assign fetched adsDataList

        if (finalMap && slotAmount && userobjectList) {
            // Get filtered list and check its structure
            const filteredList = await getFilteredList(finalMap, slotAmount);
            if (filteredList && filteredList.drawnNumbers) {
                result = filteredList.drawnNumbers;
                console.log("Filtered drawnNumbers:", result);
            } else {
                console.warn("getFilteredList did not return expected result.");
            }
        } else {
            console.warn(`Slot data is missing for interval ${interval}. FinalMap:`, finalMap, "SlotAmount:", slotAmount, "UserobjectList:", userobjectList);
        }

        console.log(`Fetched slot data for interval ${interval}:`);
        // Check if result contains any NaN values
        if (result && Array.isArray(result) && result.every(num => !isNaN(num))) {
            console.table(finalMap);
            console.table(slotAmount);
            console.log(`Filtered result for interval ${interval}:`, result);
            return { result, userobjectList, adsDataList }; // Return adsDataList properly
        } else {
            console.warn(`Filtered result contains NaN values or is invalid for interval ${interval}. Adding random values for ${periodKey}.`);
        }
    } catch (error) {
        console.error(`Error fetching or filtering data for interval ${interval}:`, error);
    }

    return { result: null, userobjectList: null, adsDataList: null }; // Ensure adsDataList is handled
}



async function addDataContinuously() {
    try {

io.on('connection', (socket) => {
    // Handle 'online' event to map uid to socket id
    socket.on('online', (data) => {
        if (data.uid) {
            const id=socket.id;
            uidToSocketMap.set(data.uid, id);
            const dataStatus={'ID':id,"UID":data.uid,'STATUS':'user online'}
            console.table([dataStatus]);
            UpdateUser({'isOnline':true,},data.uid);
        }
    });

    // Handle socket disconnection
    socket.on('disconnect', () => {
        // Find and remove the socket ID from the map by its UID
        for (const [uid, id] of uidToSocketMap.entries()) {
            if (id === socket.id) {
                uidToSocketMap.delete(uid);
                const dataStatus={'ID':id,"UID":uid,'STATUS':'user offline'}
                console.table([dataStatus]);
                UpdateUser({'isOnline':false,},uid);
                break;
            }
        }
    });
});

        scheduleNextUpdate('1min', 60000);
        scheduleNextUpdate('3min', 180000);
        scheduleNextUpdate('15min', 900000);
    } catch (error) {
        console.error('Error setting up data updates:', error);
    }
}

addDataContinuously();
// function processData(data) {
//     const result = {};
  
//     data.forEach((item) => {
//       const { userId, amount, values, time } = item;
  
//       // Initialize the user's data if it doesn't exist
//       if (!result[userId]) {
//         result[userId] = {
//           slotvalues: [],
//           time: [],
//           totalamount: 0
//         };
//       }
  
//       // Add slot values and time for the user
//       result[userId].slotvalues.push(values);
//       result[userId].time.push(time); // Convert timestamp to readable date
//       result[userId].totalamount += amount; // Sum up the amount
//     });
  
//     return result;
//   }
async function emitRemainingTimeUntil9PM() {
    // Function to calculate and emit the remaining time
    function updateRemainingTime() {
        // Update the current time
        let currentTime = new Date();
  
        // Set or update the target time to 9 PM today
        let targetTime = new Date();
        targetTime.setHours(16, 2, 0, 0); // 9:00 PM
  
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
        io.emit('digi9pm', {
            hours: hours,
            minutes: minutes,
            seconds: seconds
        });
  
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
        if (timeDifference <= 1000) {  // Allow a 1-second tolerance to ensure it triggers
            // Log that we have reached the end time
            console.log('Reached 9 PM, restarting the countdown for the next day.');
  
            try {
                // Fetch the latest slot data
                const { finalMap, slotAmount, userobjectList, slotData } = await getSlotData('megacontent');
                console.log(finalMap, slotAmount, userobjectList);
  
                // Process user data if available
                if (userobjectList) {
                    processedData = (await AssignRanksToUsers(userobjectList)).rankedDataWithPrizes;
                    await UpdateMegacontest(processedData);
                }
                console.log(processedData);
  
                
  
                // Clear the slot data
                await clearSlotData('megacontent');
                await UpdateDashBoard({'spot':0});
                console.log(`Cleared slot data for interval 'megacontent'`);
            } catch (error) {
                console.error(`Error during the 9 PM process:`, error);
            }
  
            // Clear the interval to stop the current timer
            clearInterval(interval);
  
            // Restart the timer for the next 9 PM
            emitRemainingTimeUntil9PM();
        }
    }, 1000); // Update every second
}
  
  // Call the function to start emitting remaining time
  emitRemainingTimeUntil9PM();
// function processData(data) {
//     const result = {};
  
//     data.forEach((item) => {
//       const { userId, amount, values, time } = item;
  
//       // Initialize the user's data if it doesn't exist
//       if (!result[userId]) {
//         result[userId] = {
//           slotvalues: [],
//           time: [],
//           totalamount: 0
//         };
//       }
  
//       // Add slot values and time for the user
//       result[userId].slotvalues.push(values);
//       result[userId].time.push(new Date(time.seconds * 1000)); // Convert timestamp to readable date
//       result[userId].totalamount += amount; // Sum up the amount
//     });
  
//     return result;
//   }
  
//   function matchCondition(userValues, resultValues, condition) {
//     // Check for matching conditions
//     switch (condition) {
//       case 'top1':
//         return arraysEqual(userValues, resultValues); // All match in sequence
//       case 'top2':
//         return userValues.slice(0, 4).every((val, i) => val === resultValues[i]); // First to forth match in sequence
//       case 'top3':
//         return userValues.slice(0, 3).every((val, i) => val === resultValues[i]); // First to third match in sequence
//       case 'top4_5':
//         return userValues.slice(0, 2).every((val, i) => val === resultValues[i]); // First to second match in sequence
//       case 'top6_10':
//         return userValues[0] === resultValues[0]; // Only first number match in sequence
//       case 'top11_20':
//         return new Set(userValues).size === 5 && new Set(resultValues).size === 5 && userValues.every(val => resultValues.includes(val)); // All match without sequence
//       case 'top21_30':
//         return userValues.length === 5 && resultValues.length === 5 && userValues.filter(val => resultValues.includes(val)).length === 4; // Only four numbers without sequence
//       case 'top31_50':
//         return userValues.length === 5 && resultValues.length === 5 && userValues.filter(val => resultValues.includes(val)).length === 3; // Only three numbers without sequence
//       default:
//         return false;
//     }
//   }
  
//   function findTopParticipants(processedData, resultValues) {
//     const topWinners = [];
  
//     // Check each user and their values against the result values
//     for (const userId in processedData) {
//       const user = processedData[userId];
//       const { slotvalues } = user;
  
//       for (const values of slotvalues) {
//         let condition = '';
  
//         if (matchCondition(values, resultValues, 'top1')) {
//           condition = 'top1';
//         } else if (matchCondition(values, resultValues, 'top2')) {
//           condition = 'top2';
//         } else if (matchCondition(values, resultValues, 'top3')) {
//           condition = 'top3';
//         } else if (matchCondition(values, resultValues, 'top4_5')) {
//           condition = 'top4_5';
//         } else if (matchCondition(values, resultValues, 'top6_10')) {
//           condition = 'top6_10';
//         } else if (matchCondition(values, resultValues, 'top11_20')) {
//           condition = 'top11_20';
//         } else if (matchCondition(values, resultValues, 'top21_30')) {
//           condition = 'top21_30';
//         } else if (matchCondition(values, resultValues, 'top31_50')) {
//           condition = 'top31_50';
//         }
  
//         if (condition) {
//           topWinners.push({ userId, values, condition });
//           break; // Stop checking after first match
//         }
//       }
//     }
  
//     // Ensure different users win in each category
//     const winnersByCategory = {
//       top1: [],
//       top2: [],
//       top3: [],
//       top4_5: [],
//       top6_10: [],
//       top11_20: [],
//       top21_30: [],
//       top31_50: []
//     };
  
//     topWinners.forEach(({ userId, values, condition }) => {
//       if (!winnersByCategory[condition].includes(userId)) {
//         winnersByCategory[condition].push(userId);
//       }
//     });
  
//     return winnersByCategory;
//   }


//  // Example data
// const data = [
//   // User 1
//   {
//     amount: 100,
//     values: [0, 1, 2, 3, 4],
//     userId: 'user1',
//     time: { seconds: 1725964887, nanoseconds: 941770000 }
//   },
//   {
//     amount: 100,
//     values: [0, 1, 2, 3, 4],
//     userId: 'user1',
//     time: { seconds: 1725964891, nanoseconds: 301808000 }
//   },
//   {
//     amount: 100,
//     values: [0, 1, 2, 5,5],
//     userId: 'user6',
//     time: { seconds: 1725964891, nanoseconds: 301808000 }
//   },
//   {
//     amount: 100,
//     values: [5, 6, 7, 8, 9],
//     userId: 'user1',
//     time: { seconds: 1725965252, nanoseconds: 215075000 }
//   },
//   // User 2
//   {
//     amount: 100,
//     values: [0, 1, 2, 3, 4],
//     userId: 'user2',
//     time: { seconds: 1725975081, nanoseconds: 166771000 }
//   },
//   {
//     amount: 100,
//     values: [5, 6, 7, 8, 9],
//     userId: 'user2',
//     time: { seconds: 1725975155, nanoseconds: 75308000 }
//   },
//   {
//     amount: 100,
//     values: [0, 1, 2, 3, 5],
//     userId: 'user2',
//     time: { seconds: 1725975158, nanoseconds: 937048000 }
//   },
//   // User 3
//   {
//     amount: 100,
//     values: [1, 2, 3, 4, 5],
//     userId: 'user3',
//     time: { seconds: 1725964887, nanoseconds: 941770000 }
//   },
//   {
//     amount: 100,
//     values: [5, 6, 7, 8, 9],
//     userId: 'user3',
//     time: { seconds: 1725964891, nanoseconds: 301808000 }
//   },
//   {
//     amount: 100,
//     values: [0, 1, 2, 3, 4],
//     userId: 'user3',
//     time: { seconds: 1725965252, nanoseconds: 215075000 }
//   },
//   // User 4
//   {
//     amount: 100,
//     values: [3, 4, 5, 6, 7],
//     userId: 'user4',
//     time: { seconds: 1725975081, nanoseconds: 166771000 }
//   },
//   {
//     amount: 100,
//     values: [2, 3, 4, 5, 6],
//     userId: 'user4',
//     time: { seconds: 1725975155, nanoseconds: 75308000 }
//   },
//   {
//     amount: 100,
//     values: [1, 2, 3, 4, 5],
//     userId: 'user4',
//     time: { seconds: 1725975158, nanoseconds: 937048000 }
//   },
//   // User 5
//   {
//     amount: 100,
//     values: [7, 8, 9, 0, 1],
//     userId: 'user5',
//     time: { seconds: 1725975081, nanoseconds: 166771000 }
//   },
//   {
//     amount: 100,
//     values: [6, 7, 8, 9, 0],
//     userId: 'user5',
//     time: { seconds: 1725975155, nanoseconds: 75308000 }
//   },
//   {
//     amount: 100,
//     values: [5, 6, 7, 8, 9],
//     userId: 'user5',
//     time: { seconds: 1725975158, nanoseconds: 937048000 }
//   }
// ];


// const checkMatch = (slot, drawNumbers) => {
//     const matches = slot.filter(num => drawNumbers.includes(num));
//     if (JSON.stringify(slot) === JSON.stringify(drawNumbers)) return 'top_1';
//     if (slot.slice(0, 4).toString() === drawNumbers.slice(0, 4).toString()) return 'top_2';
//     if (slot.slice(0, 3).toString() === drawNumbers.slice(0, 3).toString()) return 'top_3';
//     if (slot.slice(0, 2).toString() === drawNumbers.slice(0, 2).toString()) return 'top_4_5';
//     if (slot[0] === drawNumbers[0]) return 'top_6_10';
//     if (matches.length === 5) return 'top_11_20';
//     if (matches.length === 4) return 'top_21_30';
//     if (matches.length === 3) return 'top_31_50';
//     return null;
// };

// const categorizeWinners = (userSlots, drawNumbers) => {
//     const winners = {
//         "top_1": [],
//         "top_2": [],
//         "top_3": [],
//         "top_4_5": [],
//         "top_6_10": [],
//         "top_11_20": [],
//         "top_21_30": [],
//         "top_31_50": []
//     };

//     for (const user in userSlots) {
//         userSlots[user].slotvalues.forEach(slot => {
//             const category = checkMatch(slot, drawNumbers);
//             if (category) winners[category].push(user);
//         });
//     }

//     return winners;
// };
// const drawResultNumbers = () => Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)); // Generate 5 unique random numbers between 0-9
// const distributePrizes = (userSlots, prizePool) => {
//     const drawNumbers = drawResultNumbers(); // Use predefined draw numbers
//     const winners = categorizeWinners(userSlots, drawNumbers);
//     const totalWinners = Object.fromEntries(
//         Object.entries(winners).map(([key, value]) => [key, new Set(value).size])
//     );

//     // Define number of winners per category
//     const winnersTarget = {
//         "top_1": 1,
//         "top_2": 1,
//         "top_3": 1,
//         "top_4_5": 2,
//         "top_6_10": 5,
//         "top_11_20": 10,
//         "top_21_30": 10,
//         "top_31_50": 20
//     };

//     // Adjust winners count
//     for (const [category, target] of Object.entries(winnersTarget)) {
//         if (totalWinners[category] > target) {
//             totalWinners[category] = target;
//         }
//     }

//     // Define prize breakdown
//     const prizesPercentage = [20, 15, 10, 5, 5, 5, 5, 2.5];
//     const prizesAmount = prizesPercentage.map(p => prizePool * (p / 100));

//     // Allocate prizes
//     const positionsPrizes = {
//         "top_1": (prizesAmount[0] / winnersTarget["top_1"]) || 0,
//         "top_2": (prizesAmount[1] / winnersTarget["top_2"]) || 0,
//         "top_3": (prizesAmount[2] / winnersTarget["top_3"]) || 0,
//         "top_4_5": (prizesAmount[3] / winnersTarget["top_4_5"]) || 0,
//         "top_6_10": (prizesAmount[4] / winnersTarget["top_6_10"]) || 0,
//         "top_11_20": (prizesAmount[5] / winnersTarget["top_11_20"]) || 0,
//         "top_21_30": (prizesAmount[6] / winnersTarget["top_21_30"]) || 0,
//         "top_31_50": (prizesAmount[7] / winnersTarget["top_31_50"]) || 0
//     };

//     // Output results
//     console.log(`Draw Numbers: ${drawNumbers}`);
//     for (const [position, amount] of Object.entries(positionsPrizes)) {
//         console.log(`${position}: ${amount.toFixed(2)}`);
//     }

//     console.log("\nUser Prizes:");
//     const userPrizes = {}; // Store win amounts by user

//     for (const [category, users] of Object.entries(winners)) {
//         const prizePerUser = positionsPrizes[category] || 0;

//         console.log(`\nCategory: ${category}`);
//         if (users.length === 0) {
//             console.log("No winners");
//         } else {
//             users.forEach(user => {
//                 console.log(`User ${user}: ${prizePerUser.toFixed(2)}`);

//                 // Accumulate user prize
//                 if (!userPrizes[user]) {
//                     userPrizes[user] = 0;
//                 }
//                 userPrizes[user] += prizePerUser;
//             });
//         }
//     }

//     // Display total win amount per user
//     console.log("\nTotal Win Amount by User:");
//     Object.entries(userPrizes).forEach(([userId, winAmount]) => {
//         console.log(`User ${userId} won a total of ${winAmount.toFixed(2)}`);
//     });
// };

// const prizePool = 10000;
// const processedData = processData(data);
// distributePrizes(processedData, prizePool);

  

//   // Find top participants
//   const topParticipants = findTopParticipants(processedData, resultValues);
  
//   console.log(topParticipants);
  
//   // Helper function to compare arrays
//   function arraysEqual(arr1, arr2) {
//     return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
//   }

//   prize pool is fixed and participants amount is anything focus on prize pool , now write code for logic , and logic is  top_1,top_2,top_3,top_4_5,top_6_10 it should win difference user , like top1-10 have difference users only , drawn result that based on 


//   if user values [3,4,5,7,8] and result values [3,4,5,6,7] then macthing logic is sequnce number in user values and result values , if one user have same values then it will top_1  , and top_2 condition is there last one number is not match then and top_3 condition is there last two number is not match , top_4_5 condition is there last three number is not match , top_6_10
// function getFilteredList(data, slotWithAmount) {
//     if (!data || !slotWithAmount || Object.keys(data).length === 0 && slotWithAmount.length === 0) {
//         const randomNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10));
//         return { drawnNumbers: randomNumbers,results : {}};
//     }

//     // Calculate total collected amount and distribution amount
//     const totalCollectedAmount = Object.values(data).reduce((sum, item) => sum + item.a, 0);
//     const percentage=0.8;
//     const maxDistributionAmount = totalCollectedAmount * percentage;

//     // Step 1: Sort numbers based on their occurrences (n) and bet amounts (a)
//     const sortedNumbers = Object.entries(data)
//         .sort(([, value1], [, value2]) => (value1.a - value2.a) || (value1.n - value2.n))
//         .map(([key]) => parseInt(key, 10));

//     // Memoization object to store already calculated winnings for drawn numbers
//     const winningsCache = new Map();

//     // Function to calculate total winnings with memoization
//     function calculateTotalWinnings(drawnNumbers) {
//         const key = drawnNumbers.join(',');
//         if (winningsCache.has(key)) {
//             return winningsCache.get(key);
//         }
    
//         let totalWinnings = 0;
//         slotWithAmount.forEach(slot => {
//             // Create frequency maps for drawn numbers and slot values
//             const drawnFrequency = {};
//             const slotFrequency = {};
    
//             drawnNumbers.forEach(number => {
//                 drawnFrequency[number] = (drawnFrequency[number] || 0) + 1;
//             });
    
//             slot.values.forEach(number => {
//                 slotFrequency[number] = (slotFrequency[number] || 0) + 1;
//             });
    
//             // Calculate the number of matches based on the minimum frequency of each number
//             let matches = 0;
//             for (const number in slotFrequency) {
//                 if (drawnFrequency[number]) {
//                     matches += Math.min(drawnFrequency[number], slotFrequency[number]);
//                 }
//             }
    
//             // Determine the multiplier based on the number of matches
//             let multiplier = 0;
//             switch (matches) {
//                 case 2:
//                     multiplier = 10;
//                     break;
//                 case 3:
//                     multiplier = 150;
//                     break;
//                 case 4:
//                     multiplier = 200;
//                     break;
//                 case 5:
//                     multiplier = 250;
//                     break;
//             }
    
//             totalWinnings += (slot.amount / 5) * multiplier;
//         });
    
//         winningsCache.set(key, totalWinnings);
//         return totalWinnings;
//     }
    

//     // Function to generate combinations of drawn numbers with repetition
//     function generateCombinationsWithRepetition(arr, size) {
//         const result = [];
//         function helper(path) {
//             if (path.length === size) {
//                 result.push([...path]);
//                 return;
//             }
//             for (let i = 0; i < arr.length; i++) {
//                 path.push(arr[i]);
//                 helper(path);
//                 path.pop();
//             }
//         }
//         helper([]);
//         return result;
//     }

//     // Function to find the best valid combination of drawn numbers
//     function findBestCombination() {
//         let bestCombination = [];
//         let closestWinAmount = 0;
//         let minDifference = Infinity;

//         // Generate combinations with repetition
//         const combinations = generateCombinationsWithRepetition(sortedNumbers, 5);
//         const validCombinations = [];

//         combinations.forEach(combination => {
//             const totalWinnings = calculateTotalWinnings(combination);
//             if (totalWinnings <= maxDistributionAmount) {
//                 validCombinations.push({ combination, totalWinnings });
//             }
//         });

//         if (validCombinations.length === 0) {
//             console.log('No valid combination found that meets the criteria.');

//             // Fallback logic to find a combination with repetition
//             const fallbackCombination = sortedNumbers.slice(0, 5); // Basic fallback
//             const fallbackTotalWinnings = calculateTotalWinnings(fallbackCombination);
//             return { drawnNumbers: fallbackCombination, totalWinAmount: fallbackTotalWinnings };
//         }

//         validCombinations.forEach(({ combination, totalWinnings }) => {
//             const difference = Math.abs(totalWinnings - maxDistributionAmount);
//             if (difference < minDifference) {
//                 minDifference = difference;
//                 closestWinAmount = totalWinnings;
//                 bestCombination = combination;
//             }
//         });

//         console.log('Best combination found:', bestCombination);
//         console.log('Total Win Amount for best combination:', closestWinAmount);

//         return { drawnNumbers: bestCombination, totalWinAmount: closestWinAmount };
//     }

//     // Get the best valid combination of drawn numbers
//     const { drawnNumbers, totalWinAmount } = findBestCombination();

//     if (drawnNumbers.length === 0) {
//         // If no valid combination was found, return default values
//         console.log('Returning default random numbers as no valid combination was found.');
//         const randomNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10));
//         return { drawnNumbers: randomNumbers, distribution: {} };
//     }

//     // Calculate final results based on adjusted drawn numbers
//     // Calculate final results based on adjusted drawn numbers
// const results = {};
// slotWithAmount.forEach(slot => {
//     // Create frequency maps for drawn numbers and slot values
//     const drawnFrequency = {};
//     const slotFrequency = {};

//     drawnNumbers.forEach(number => {
//         drawnFrequency[number] = (drawnFrequency[number] || 0) + 1;
//     });

//     slot.values.forEach(number => {
//         slotFrequency[number] = (slotFrequency[number] || 0) + 1;
//     });

//     // Calculate the matched numbers based on the minimum frequency of each number
//     const matchedNumbers = [];
//     for (const number in slotFrequency) {
//         if (drawnFrequency[number]) {
//             const minMatches = Math.min(drawnFrequency[number], slotFrequency[number]);
//             for (let i = 0; i < minMatches; i++) {
//                 matchedNumbers.push(parseInt(number, 10));
//             }
//         }
//     }

//     // Determine the multiplier based on the number of matches
//     let multiplier = 0;
//     switch (matchedNumbers.length) {
//         case 2:
//             multiplier = 10;
//             break;
//         case 3:
//             multiplier = 150;
//             break;
//         case 4:
//             multiplier = 200;
//             break;
//         case 5:
//             multiplier = 250;
//             break;
//     }

//     const winnings = (slot.amount / 5) * multiplier;
//     results[slot.values.join(',')] = {
//         matchedNumbers: matchedNumbers.join(','),
//         winnings,
//         amount: slot.amount,
//         eachnumberamount: (slot.amount / 5),
//         totalWinAmount
//     };
// });


//     console.log('Amount:', '100%', totalCollectedAmount, `${(percentage)*100}%` , maxDistributionAmount, `${(1-percentage)*100}%`, totalCollectedAmount - maxDistributionAmount);
//     console.log('Drawn Numbers:', drawnNumbers);
//     console.log('Total Win Amount:', totalWinAmount);
//     console.log('Results per slot:');
//     console.table(results);
    
//     return { drawnNumbers, results };
// }


// // Sample data
// const slotWithAmount = [
//     { amount: 10, values: [0, 4, 1, 6, 1] },
//     { amount: 10, values: [0, 3, 7, 8, 9] },
//     { amount: 10, values: [1, 4, 7, 8, 1] },
//     { amount: 10, values: [0, 1, 1, 1, 1] },
//     { amount: 10, values: [0, 3, 7, 8, 9] },
//     { amount: 10, values: [1, 4, 7, 8, 1] },
//     { amount: 10, values: [0, 3, 7, 8, 9] },
   
// ];
// const data = {};

// // Initialize data object with keys 0 to 9
// for (let i = 0; i <= 9; i++) {
//     data[i] = { a: 0, n: 0 };
// }

// // Loop through the slotWithAmount array
// slotWithAmount.forEach(slot => {
//     const { amount, values } = slot;
//     // Calculate the share of the amount for each occurrence in the values array
//     const share = amount / values.length;

//     values.forEach(value => {
//         data[value].a += share;
//         data[value].n += 1;
//     });
// });

// // Example usage
// const result = getFilteredList(data, slotWithAmount);

// async function updateRemainingTime(interval, remainingTime) {
//     try {
//         const periodDocRef = doc(db, "period", interval);
//         await updateDoc(periodDocRef, {
//             remainingTime: remainingTime
//         });
//         console.log(`Remaining time for ${interval} interval updated successfully: ${remainingTime.minutes}:${remainingTime.seconds}`);
//     } catch (error) {
//         console.error(`Error updating remaining time for ${interval} interval:`, error);
//     }
// }

app.get("/", (req, res) => {
    const serverUrl = `${req.protocol}://${req.hostname}:${process.env.PORT || 8000}`;
    console.log(serverUrl);
    res.send('<style type="text/css"> body{animation: backcolor 3s ease forwards;} @keyframes backcolor{from{background:#1f2c34;}to{background:#1f2c34;}} #omkar{position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); animation: singh 0.2s ease forwards 1s;} #omkar path:nth-child(1){stroke-dasharray: 294.929px; stroke-dashoffset:294.929px; animation: omkar 0.2s ease forwards;} #omkar path:nth-child(2){stroke-dasharray: 558.775px; stroke-dashoffset:558.775px; animation: omkar 0.2s ease forwards 0.1s;} #omkar path:nth-child(3){stroke-dasharray:300.030px; stroke-dashoffset: 300.030px; animation: omkar 0.2s ease forwards 0.2s;} #omkar path:nth-child(4){ stroke-dasharray: 296.131px; stroke-dashoffset: 296.131px; animation: omkar 0.2s ease forwards 0.3s;} #omkar path:nth-child(5){ stroke-dasharray: 304.497px; stroke-dashoffset: 304.497px; animation: omkar 0.2s ease forwards 0.4s;} #omkar path:nth-child(6){ stroke-dasharray: 291.558px; stroke-dashoffset:291.558px ; animation: omkar 0.2s ease forwards 0.5s;} #omkar path:nth-child(7){ stroke-dasharray: 142.478px; stroke-dashoffset: 142.478px; animation: omkar 0.2s ease forwards 0.6s;} #omkar path:nth-child(8){ stroke-dasharray:423.628px; stroke-dashoffset: 423.628px; animation: omkar 0.2s ease forwards 0.7s; } #omkar path:nth-child(9){ stroke-dasharray:293.610px; stroke-dashoffset: 293.610px; animation: omkar 0.2s ease forwards 0.8s;} #omkar path:nth-child(10){ stroke-dasharray:319.019px; stroke-dashoffset:319.019px; animation: omkar 0.1s ease forwards 0.9s;} @keyframes omkar{ to{ stroke-dashoffset: 0;}} @keyframes singh{ from{ fill:transparent;} to{ fill: white; } } </style> <svg id="omkar" width="250" height="60" viewBox="0 0 349 67" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.823 66.486C7.205 66.216 4.586 65.19 2.966 63.408C1.346 61.599 0.508999 58.8045 0.454999 55.0245C0.400999 50.9205 0.360499 47.127 0.333499 43.644C0.306499 40.134 0.292999 36.732 0.292999 33.438C0.292999 30.117 0.306499 26.742 0.333499 23.313C0.360499 19.857 0.400999 16.158 0.454999 12.216C0.508999 8.43599 1.346 5.64149 2.966 3.83249C4.586 2.02349 7.205 0.983989 10.823 0.713989V6.34349C9.419 6.55949 8.42 7.11299 7.826 8.00399C7.259 8.86799 6.962 10.191 6.935 11.973C6.8 16.05 6.7055 19.8165 6.6515 23.2725C6.6245 26.7285 6.611 30.09 6.611 33.357C6.611 36.624 6.6245 40.026 6.6515 43.563C6.7055 47.073 6.8 50.961 6.935 55.227C6.962 57.063 7.259 58.413 7.826 59.277C8.42 60.114 9.419 60.6405 10.823 60.8565V66.486ZM15.278 66.4455V60.8565C16.682 60.6135 17.654 60.0735 18.194 59.2365C18.761 58.3725 19.058 57.036 19.085 55.227C19.22 51.069 19.3145 47.2485 19.3685 43.7655C19.4225 40.2825 19.4495 36.9075 19.4495 33.6405C19.4495 30.3735 19.4225 26.9985 19.3685 23.5155C19.3145 20.0055 19.22 16.158 19.085 11.973C19.058 10.191 18.761 8.86799 18.194 8.00399C17.654 7.13999 16.682 6.58649 15.278 6.34349V0.754491C18.788 1.02449 21.3395 2.07749 22.9325 3.91349C24.5255 5.72249 25.3625 8.48999 25.4435 12.216C25.5515 16.158 25.619 19.857 25.646 23.313C25.7 26.742 25.727 30.117 25.727 33.438C25.727 36.732 25.7 40.134 25.646 43.644C25.619 47.127 25.5515 50.9205 25.4435 55.0245C25.3625 58.7775 24.5255 61.545 22.9325 63.327C21.3395 65.109 18.788 66.1485 15.278 66.4455Z"  stroke= "white"  stroke-width="1px"/><path d="M50.4257 65.7165L47.9957 47.0865L44.0672 6.95099H34.9142V1.19999H49.4537L52.2887 28.335L55.1642 59.9655H57.4322L60.1862 28.3755L63.0617 1.19999H77.6012V6.95099H68.4887L64.6412 46.6815L62.1302 65.7165H50.4257ZM34.9142 66V9.98849H41.1512L41.4347 47.1675V66H34.9142ZM71.0402 66V47.1675L71.3237 9.98849H77.6012V66H71.0402Z"  stroke= "white"  stroke-width="1px" /><path d="M87.4376 66V35.463H95.6186L101.451 15.0915L105.946 1.19999H112.872L93.9581 54.6195V66H87.4376ZM107.283 66L101.167 45.1425L104.893 35.5035L113.884 66H107.283ZM87.4376 31.575V1.19999H94.1606V15.0915L93.5126 31.575H87.4376Z"  stroke= "white"  stroke-width="1px"/><path d="M116.482 66L123.448 1.19999H136.813L137.421 6.99149H128.43L126.931 28.092L125.595 41.9025H132.358L130.819 47.694H124.987L123.084 66H116.482ZM137.056 66L133.33 27.9705L131.994 10.3125H137.664L143.617 66H137.056Z"  stroke= "white"  stroke-width="1px" /><path d="M169.713 66L163.76 41.214H161.654V35.4225H163.233C165.177 35.4225 166.541 35.0985 167.324 34.4505C168.134 33.7755 168.552 32.628 168.579 31.008C168.66 28.551 168.714 26.31 168.741 24.285C168.795 22.233 168.809 20.1945 168.782 18.1695C168.782 16.1175 168.714 13.8765 168.579 11.4465C168.498 9.79949 168.066 8.65199 167.283 8.00399C166.527 7.32899 165.204 6.99149 163.314 6.99149H161.451V1.19999H163.314C167.364 1.19999 170.294 2.00999 172.103 3.62999C173.912 5.24999 174.884 7.93649 175.019 11.6895C175.127 14.2275 175.181 16.5495 175.181 18.6555C175.208 20.7615 175.208 22.7865 175.181 24.7305C175.181 26.6475 175.127 28.659 175.019 30.765C174.83 35.625 173.102 38.73 169.835 40.08L176.396 66H169.713ZM150.719 66V1.19999H157.158V66H150.719Z"  stroke= "white"  stroke-width="1px" /><path d="M209.945 66.486C206.408 66.216 203.83 65.217 202.21 63.489C200.59 61.734 199.726 59.0205 199.618 55.3485C199.591 53.8095 199.564 52.3785 199.537 51.0555C199.537 49.7055 199.55 48.3555 199.577 47.0055C199.604 45.6285 199.645 44.1435 199.699 42.5505H205.895C205.787 44.9535 205.72 47.262 205.693 49.476C205.693 51.663 205.76 53.8905 205.895 56.1585C205.949 57.6435 206.273 58.7505 206.867 59.4795C207.488 60.2085 208.514 60.6675 209.945 60.8565V66.486ZM214.279 66.486V60.8565C215.602 60.6405 216.547 60.1815 217.114 59.4795C217.681 58.7505 218.018 57.6435 218.126 56.1585C218.234 54.9975 218.288 53.742 218.288 52.392C218.315 51.015 218.302 49.6515 218.248 48.3015C218.221 46.9515 218.18 45.6825 218.126 44.4945C218.072 42.3345 217.64 40.7145 216.83 39.6345C216.02 38.5545 214.697 37.785 212.861 37.326L208.366 36.2325C206.152 35.6925 204.41 34.9095 203.141 33.8835C201.872 32.8305 200.968 31.4265 200.428 29.6715C199.888 27.9165 199.577 25.689 199.496 22.989C199.469 21.234 199.456 19.4115 199.456 17.5215C199.483 15.6045 199.51 13.674 199.537 11.73C199.645 8.08499 200.509 5.39849 202.129 3.67049C203.749 1.94249 206.354 0.956991 209.945 0.713989V6.34349C208.568 6.53249 207.569 6.99149 206.948 7.72049C206.354 8.42249 206.03 9.51599 205.976 11.001C205.868 13.053 205.814 15.0375 205.814 16.9545C205.814 18.8715 205.868 20.883 205.976 22.989C206.03 25.311 206.354 27.0255 206.948 28.1325C207.542 29.2125 208.568 29.928 210.026 30.279L214.279 31.251C216.817 31.845 218.815 32.6685 220.273 33.7215C221.758 34.7745 222.824 36.1785 223.472 37.9335C224.147 39.6885 224.525 41.8755 224.606 44.4945C224.66 45.6285 224.687 46.83 224.687 48.099C224.687 49.341 224.674 50.583 224.647 51.825C224.62 53.067 224.593 54.2415 224.566 55.3485C224.404 59.0205 223.526 61.734 221.933 63.489C220.34 65.244 217.789 66.243 214.279 66.486ZM218.005 23.6775C218.086 21.1935 218.126 18.939 218.126 16.914C218.153 14.889 218.126 12.918 218.045 11.001C217.991 9.54299 217.681 8.44949 217.114 7.72049C216.547 6.99149 215.602 6.51899 214.279 6.30299V0.713989C217.708 0.983989 220.205 1.98299 221.771 3.71099C223.337 5.43899 224.188 8.13899 224.323 11.811C224.377 13.485 224.39 15.3345 224.363 17.3595C224.336 19.3575 224.296 21.4635 224.242 23.6775H218.005Z"  stroke= "white"  stroke-width="1px" /><path d="M233.222 66V1.19999H239.661V66H233.222Z"  stroke= "white"  stroke-width="1px" /><path d="M266.772 66L263.086 42.753L258.226 6.95099H249.438V1.19999H262.924L266.205 22.6245L271.551 60.168H280.299V66H266.772ZM249.438 66V10.029H255.229L255.472 41.3355L255.837 66H249.438ZM274.426 57.09L274.183 24.204L273.859 1.19999H280.299V57.09H274.426Z"  stroke= "white"  stroke-width="1px" /><path d="M300.34 66.486C296.587 66.243 293.901 65.2575 292.281 63.5295C290.688 61.7745 289.851 59.0475 289.77 55.3485C289.689 51.7305 289.635 48.1125 289.608 44.4945C289.581 40.8765 289.567 37.272 289.567 33.681C289.567 30.063 289.581 26.4585 289.608 22.8675C289.635 19.2495 289.689 15.645 289.77 12.054C289.878 8.27399 290.728 5.50649 292.321 3.75149C293.941 1.96949 296.614 0.956991 300.34 0.713989V6.30299C298.747 6.49199 297.667 6.96449 297.1 7.72049C296.533 8.47649 296.223 9.66449 296.169 11.2845C296.061 15.3615 295.98 19.2225 295.926 22.8675C295.899 26.5125 295.885 30.09 295.885 33.6C295.885 37.083 295.899 40.647 295.926 44.292C295.98 47.937 296.061 51.798 296.169 55.875C296.223 57.495 296.533 58.6965 297.1 59.4795C297.667 60.2355 298.747 60.708 300.34 60.897V66.486ZM304.593 66.486V60.9375C306.294 60.7485 307.441 60.276 308.035 59.52C308.656 58.737 308.994 57.522 309.048 55.875C309.075 54.552 309.088 53.283 309.088 52.068C309.115 50.826 309.115 49.5975 309.088 48.3825C309.088 47.1405 309.075 45.858 309.048 44.535H302.608V38.703H315.366C315.42 42.078 315.433 45.075 315.406 47.694C315.406 50.313 315.366 52.8645 315.285 55.3485C315.177 59.0745 314.313 61.8015 312.693 63.5295C311.073 65.2575 308.373 66.243 304.593 66.486ZM308.602 23.6775C308.683 21.3825 308.724 19.317 308.724 17.481C308.724 15.618 308.683 13.5525 308.602 11.2845C308.521 9.66449 308.211 8.48999 307.671 7.76099C307.131 7.00499 306.105 6.53249 304.593 6.34349V0.713989C308.211 0.983989 310.816 1.98299 312.409 3.71099C314.002 5.43899 314.88 8.13899 315.042 11.811C315.123 13.863 315.163 15.834 315.163 17.724C315.163 19.587 315.123 21.5715 315.042 23.6775H308.602Z"  stroke= "white"  stroke-width="1px" /><path d="M323.872 66V1.19999H330.312V66H323.872ZM327.558 36.3135V30.522H339.465L337.926 36.3135H327.558ZM342.259 66V1.19999H348.699V66H342.259Z"  stroke= "white"  stroke-width="1px" /></svg>');
});
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});