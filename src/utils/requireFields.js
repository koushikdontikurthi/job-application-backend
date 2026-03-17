function requireFields(body, fields) {
    for (const field of fields) {
        if(body[field] === undefined || body[field] === null || body[field] === '') {
            return {ok: false, message: `Missing required field: ${field}`};
        }
    }
    return {ok: true};
}

module.exports = requireFields;