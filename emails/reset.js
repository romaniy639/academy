const keys = require('../keys')

module.exports = function(email, token) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Resetting password',
        html: `
        <h1>Access recovery</h1>
        <p>If you didn't request password reset then ignore this message! Otherwise please proceed with a link down below.</p>
        <p><a href="${keys.BASE_URL}/password/${token}" target="_blank">RESET PASSWORD</a></p>
        <hr>
        <a href="${keys.BASE_URL}">Academy homepage</a>
        `
    }
}