/*
Metadata:
questionNo: 1
problemName: Two Sum
problemStatement: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
technique: Hash Map
topic: Arrays
difficulty: Easy
*/

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
const twoSum = function (nums, target) {
  //create a map
  const map = new Map();

  //loop through the nums array
  for (let i = 0; i < nums.length; i++) {
    //find complement
    const complement = target - nums[i];
    //check if complement already exists in map
    if (map.has(complement)) {
      //return indices if matched
      return [map.get(complement), i];
    }
    //else add to map
    map.set(nums[i], i);
  }
  //return empty array if no match found
  return [];
};
