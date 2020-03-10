const keys = require('../keys')

module.exports = function(username, email, password) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Your "Academy" account has been successfully created!',
        html: `
        <h1>${username}, sincerely welcome in our academy!</h1>
        <p>email : password - ${email} : ${password}</p>
        <hr>
        <a href="${keys.BASE_URL}">Academy homepage</a>
        `
    }
}