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
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }

  return [];
};
