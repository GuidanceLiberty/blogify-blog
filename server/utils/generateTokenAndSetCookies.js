import jwt from 'jsonwebtoken'

export const generateTokenAndSetCookies = (res, userId) => {
    const token = jwt.sign(
        { userId }, 
        process.env.JWT_SECRET, 
        {expiresIn: '7d'});

        res.cookie("token", token, 
        {
            httpOnly: true,
            secure: process.env.ENV_MODE === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
        });

    return token;
}