import jwt from 'jsonwebtoken';

// --------------------------------------------------------------------------------------------------- // 
// cookies authorization
export const authenticateUser = (req, res, next) => {
    const token = req.cookies.authToken; 
    
    if (!token) {
        return res.status(401).send({ message: 'User not authenticated.' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Invalid token.' });
        }

        req.user = decoded; 
        next();
    });
};

// --------------------------------------------------------------------------------------------------- // 
// Role checker
export const checkRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user.role) {
            return res.status(401).send({ message: 'User not authenticated.' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).send({ message: 'Invalid Access' });
        }

        next();
    }
}


