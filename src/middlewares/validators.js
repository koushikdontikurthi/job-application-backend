const validateSignup = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required'
        });
    }
    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required'
        });
    }
    next();
};

const validateJob = (req, res, next) => {
    const { title, company } = req.body;
    if (!title || !company) {
        return res.status(400).json({
            code: 'VALIDATION_ERROR',   
            message: 'Title and company are required'
        });
    }
    next();
}

const validateCreateApplication = (req, res, next) => {
    const { jobId } = req.body;
    if (!jobId) {
        return res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: 'Job ID is required'
        });
    }
    next();
};

module.exports = {
    validateSignup,
    validateLogin,
    validateJob,
    validateCreateApplication
};  