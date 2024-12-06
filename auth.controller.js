const md5 = require(`md5`)
const jwt = require(`jsonwebtoken`)
const userModel = require(`../models/index`).user

const authenticate = async (request, response) => {
    let { username, password } = request.body;

    // Validate input
    if (!username || !password) {
        return response.json({
            success: false,
            logged: false,
            message: "Username and password are required."
        });
    }

    // Encrypt the password
    let dataLogin = {
        username: username,
        password: md5(password)
    };

    try {
        let dataUser = await userModel.findOne({ where: dataLogin });

        if (dataUser) {
            let payload = JSON.stringify(dataUser);
            let secret = `mokleters`;
            let token = jwt.sign(payload, secret);

            return response.json({
                success: true,
                logged: true,
                message: `Authentication Successed`,
                token: token,
                data: dataUser
            });
        }

        return response.json({
            success: false,
            logged: false,
            message: `Authentication Failed. Invalid username or password`
        });

    } catch (error) {
        return response.status(500).json({
            success: false,
            message: `Server error: ${error.message}`
        });
    }
};

module.exports = { authenticate }

const authorize = (request, response, next) => {
    // Extract the token from the Authorization header
    let headers = request.headers.authorization;
    let tokenKey = headers && headers.split(" ")[1];

    // Check if the token is provided
    if (!tokenKey) {
        return response.json({
            success: false,
            message: `Unauthorized User. Token is required.`
        });
    }

    // Define the secret key
    let secret = `mokleters`;

    // Verify the token
    jwt.verify(tokenKey, secret, (error, user) => {
        if (error) {
            return response.json({
                success: false,
                message: `Invalid or expired token.`
            });
        }

        // Attach user information to the request for further use
        request.user = user;

        // Proceed to the next middleware or route handler
        next();
    });
};

module.exports = { authenticate, authorize }