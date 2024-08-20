const errorHandler = (err, req,res,next) => {
    console.error(err.stack); //Log the error stack trace for debugging

    //Set default values if th error does not have a status or message

    const statusCode = err.status || 500;
    const message = err. message || ' Internal Server Error';

    //Send a JSON response to the client with the status code and error message
    res.status(statusCode).json({
        success: false,
        error: {
            message: message,
        },
    });
}

module.exports = errorHandler;