/**
 * @function asyncHandler middleware
 * @ this function handles the error handling in controller for async functions
 * @ contains promise object to resolve and catch
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
}

export default asyncHandler;