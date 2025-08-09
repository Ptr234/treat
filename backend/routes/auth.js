import express from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { User } from '../models/User.js';
import { EmailVerification } from '../models/EmailVerification.js';
import emailService from '../services/emailService.js';
import googleOAuthService from '../services/googleOAuthService.js';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match'
  }),
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  phone: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required(),
  type: Joi.string().valid('registration', 'login').default('registration')
});

const googleAuthSchema = Joi.object({
  idToken: Joi.string().required()
});

const resendCodeSchema = Joi.object({
  email: Joi.string().email().required(),
  type: Joi.string().valid('registration', 'login').default('registration')
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register new user (Step 1: Create user and send verification code)
router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(value.email);
    if (existingUser && existingUser.is_verified) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // If user exists but is not verified, delete the old record
    if (existingUser && !existingUser.is_verified) {
      await User.deleteById(existingUser.id);
    }

    // Create new user (unverified)
    const user = await User.create({ ...value, is_verified: false });
    
    // Generate and send verification code
    const verificationCode = emailService.generateVerificationCode();
    await EmailVerification.create({
      email: value.email,
      code: verificationCode,
      type: 'registration',
      userId: user.id
    });

    await emailService.sendVerificationEmail(value.email, verificationCode, 'registration');

    res.status(201).json({
      success: true,
      message: 'Registration initiated. Please check your email for verification code.',
      data: {
        email: value.email,
        requiresVerification: true
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login user (Step 1: Verify credentials and send verification code)
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Find user by email
    const user = await User.findByEmail(value.email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is verified
    if (!user.is_verified) {
      return res.status(401).json({
        success: false,
        message: 'Account not verified. Please complete registration first.',
        requiresRegistration: true
      });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(value.password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate and send verification code
    const verificationCode = emailService.generateVerificationCode();
    await EmailVerification.create({
      email: value.email,
      code: verificationCode,
      type: 'login',
      userId: user.id
    });

    await emailService.sendVerificationEmail(value.email, verificationCode, 'login');

    res.json({
      success: true,
      message: 'Verification code sent to your email',
      data: {
        email: value.email,
        requiresVerification: true
      }
    });
  } catch (error) {
    next(error);
  }
});

// Verify token
router.get('/verify', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Verify email code (Step 2: Complete registration or login)
router.post('/verify-email', async (req, res, next) => {
  try {
    const { error, value } = verifyEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Find verification record
    const verification = await EmailVerification.findByEmailAndCode(
      value.email, 
      value.code, 
      value.type
    );

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Mark verification as completed
    await EmailVerification.markAsVerified(verification.id);

    if (value.type === 'registration') {
      // Mark user as verified and send welcome email
      const user = await User.markAsVerified(verification.user_id);
      await emailService.sendWelcomeEmail(user.email, user.first_name);
      
      const token = generateToken(user.id);
      
      res.json({
        success: true,
        message: 'Registration completed successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role
          },
          token
        }
      });
    } else {
      // Login verification
      const user = await User.findById(verification.user_id);
      const token = generateToken(user.id);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role
          },
          token
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// Google OAuth authentication
router.post('/google', async (req, res, next) => {
  try {
    const { error, value } = googleAuthSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Verify Google ID token
    const googleUser = await googleOAuthService.verifyIdToken(value.idToken);
    
    if (!googleUser.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Google account email is not verified'
      });
    }

    // Check if user exists
    let user = await User.findByEmail(googleUser.email);
    
    if (user) {
      // User exists - generate verification code for login
      const verificationCode = emailService.generateVerificationCode();
      await EmailVerification.create({
        email: googleUser.email,
        code: verificationCode,
        type: 'login',
        userId: user.id
      });

      await emailService.sendVerificationEmail(googleUser.email, verificationCode, 'login');
      
      res.json({
        success: true,
        message: 'Verification code sent to your email',
        data: {
          email: googleUser.email,
          requiresVerification: true,
          isExistingUser: true
        }
      });
    } else {
      // New user - create account and generate verification code
      const newUser = await User.create({
        email: googleUser.email,
        password: 'google-oauth-' + Math.random().toString(36),
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        is_verified: false
      });
      
      const verificationCode = emailService.generateVerificationCode();
      await EmailVerification.create({
        email: googleUser.email,
        code: verificationCode,
        type: 'registration',
        userId: newUser.id
      });

      await emailService.sendVerificationEmail(googleUser.email, verificationCode, 'registration');
      
      res.status(201).json({
        success: true,
        message: 'Account created with Google. Please check your email for verification code.',
        data: {
          email: googleUser.email,
          requiresVerification: true,
          isExistingUser: false
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// Resend verification code
router.post('/resend-code', async (req, res, next) => {
  try {
    const { error, value } = resendCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Check if there's a pending verification
    const pendingVerification = await EmailVerification.findPendingByEmail(value.email, value.type);
    if (!pendingVerification) {
      return res.status(400).json({
        success: false,
        message: 'No pending verification found for this email'
      });
    }

    // Check rate limit (wait at least 1 minute)
    const remainingTime = await EmailVerification.getRemainingTime(value.email, value.type);
    if (remainingTime > 540) { // 9 minutes remaining = sent less than 1 minute ago
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting a new code',
        remainingSeconds: Math.ceil(remainingTime - 540)
      });
    }

    // Generate and send new verification code
    const verificationCode = emailService.generateVerificationCode();
    await EmailVerification.create({
      email: value.email,
      code: verificationCode,
      type: value.type,
      userId: pendingVerification.user_id
    });

    await emailService.sendVerificationEmail(value.email, verificationCode, value.type);

    res.json({
      success: true,
      message: 'New verification code sent to your email'
    });
  } catch (error) {
    next(error);
  }
});

export default router;