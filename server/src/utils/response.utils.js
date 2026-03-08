const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

const sendError = (res, message = 'Server Error', statusCode = 500, errors = null) => {
    // Log detailed error for 500s to Vercel/Server console
    if (statusCode === 500) {
        console.error(' [VISTA ERROR] 500:', message);
        if (errors) console.error(' [DETAILS]:', errors);
    }

    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};

module.exports = { sendSuccess, sendError };
