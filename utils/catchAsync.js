// wrapper used to catch errors in the route callbacks.
// If an error occurs in the function that is wrapped, 
// this function is going to catch it, and pass it to 
// our error handling middleware.
module.exports = func => {
    // return a new function that has func executed,
    // and catches its error
    return (req, res, next) => {
        // For errors returned from asynchronous functions
        // invoked by route handlers and middleware, 
        // you must pass them to the next() function, 
        // where Express will catch and process them.
        func(req, res, next).catch(next);
    }
}