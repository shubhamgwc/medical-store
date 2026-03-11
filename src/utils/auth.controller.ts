import e, { Request, Response } from 'express';
import { errorLogger } from '../utils/logger.util';
import validate from '../utils/validate.util';
import app_constants from '../constants/app';
import { loginUserService, logoutAccountService, registerUserService } from '../services/auth.service';


export const registerUser = async (req: Request, res: Response) => {
    const body = JSON.stringify(req.body);

    try {
        const validation = validate.validate(req.body, {
            email: 'required',
            password: 'required'
        });

        if (validation.hasError) {
            return res.status(app_constants.BAD_REQUEST).json({
                success: 0,
                status_code: app_constants.BAD_REQUEST,
                message: validation.errors?.join(', ')
            });
        }

        const register_user_res = await registerUserService(req.body);
        return res.status(register_user_res.status_code).json(register_user_res);
    } catch (err) {
        errorLogger(err as Error, JSON.parse(body), res);
    }
};


/**
 * Authenticates a user with email and password.
 * @param {Request} req - Express request with email and password.
 * @param {Response} res - Express response to return login result.
 * @returns {Promise<Response | undefined>} - JSON response with login result.
 */

export const loginUser = async (req: Request, res: Response) => {
    const body = JSON.stringify(req.body);

    try {
        const validation = validate.validate(req.body, {
            email: 'required',
            password: 'required'
        });

        if (validation.hasError) {
            return res.status(app_constants.BAD_REQUEST).json({
                success: 0,
                status_code: app_constants.BAD_REQUEST,
                message: validation.errors?.join(', ')
            });
        }

        const account_login = await loginUserService(req.body);
        // If the login is successful and a token is returned, set the token as an HTTP cookie
        if ('token' in account_login && account_login?.success && account_login?.token) {
            const isProduction = process.env.NODE_ENV === 'production';
            const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';

            res.cookie("token", account_login.token, {
                httpOnly: true,
                secure: isProduction && isHttps, // 🔥 KEY FIX
                sameSite: isProduction ? 'none' : 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            if (process.env.NODE_ENV === 'production') {
                delete account_login?.token;
            };
        };

        return res.status(account_login.status_code).json(account_login);
    } catch (err) {
        errorLogger(err as Error, JSON.parse(body), res);
    };
};



export const logoutAccount = async (req: Request, res: Response): Promise<Response | undefined> => {
    let body = JSON.stringify(req.body);

    try {
        const token = process.env.NODE_ENV == 'production' ? req.cookies.token : req.headers['authorization']?.split(' ')[1];
        const account_logout = await logoutAccountService(token);

        res.clearCookie('token');
        return res.status(account_logout.status_code).json(account_logout);
    }

    catch (err) {
        errorLogger(err as Error, JSON.parse(body), res);
    };
};