import jwt from 'jsonwebtoken';
import ErrorResponse from './errorResponse.js';

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '90d' }
  );
};

// Verify JWT token
const verifyToken = (token, isRefreshToken = false) => {
  try {
    const secret = isRefreshToken 
      ? process.env.JWT_REFRESH_SECRET 
      : process.env.JWT_SECRET;
      
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ErrorResponse('Token has expired', 401);
    }
    throw new ErrorResponse('Invalid token', 401);
  }
};

// Generate token and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  
  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  // Remove password from output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      expires: new Date(
        Date.now() + (process.env.JWT_REFRESH_EXPIRE_DAYS || 90) * 24 * 60 * 60 * 1000
      ),
    })
    .json({
      success: true,
      token,
      refreshToken,
      user,
    });
};

// Generate reset token
const getResetPasswordToken = () => {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return { resetToken, resetPasswordToken, resetPasswordExpire };
};

export {
  generateToken,
  generateRefreshToken,
  verifyToken,
  sendTokenResponse,
  getResetPasswordToken,
};
