import { Request, Response, NextFunction } from 'express';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Here you would typically verify the token
    // For example, using a library like jsonwebtoken
    // jwt.verify(token, secret, (err, decoded) => {
    //     if (err) {
    //         return res.status(401).json({ message: 'Unauthorized' });
    //     }
    //     req.user = decoded; // Save the decoded user info to the request
    //     next();
    // });

    // For now, we'll just simulate a successful authentication
    req.user = { id: 1, name: 'Test User' }; // Simulated user data
    next();
};

export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role; // Assuming user role is attached to req.user

        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    };
};