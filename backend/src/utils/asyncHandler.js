/**
 * Async handler to wrap around Express route handlers
 * Automatically catches errors and passes them to Express's error handling middleware
 * 
 * @param {Function} fn - The async route handler function
 * @returns {Function} - A new function that handles async/await errors
 * 
 * @example
 * // Instead of:
 * router.get('/', async (req, res, next) => {
 *   try {
 *     const data = await someAsyncOperation();
 *     res.json(data);
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 * 
 * // You can write:
 * router.get('/', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  // Return a new function that wraps the original async function
  // and handles any errors that occur during its execution
  return Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
