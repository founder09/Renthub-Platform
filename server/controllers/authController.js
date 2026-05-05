const User         = require('../models/User');
const ExpressError = require('../utils/ExpressError');

// Cookie options shared between login and register
const cookieOptions = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
};

/** POST /api/auth/register */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return next(new ExpressError(400, 'All fields are required'));
    }

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      return next(new ExpressError(400, 'Username or email already taken'));
    }

    // Default to tenant if invalid role is passed
    const assignedRole = ['tenant', 'owner'].includes(role) ? role : 'tenant';

    const user = await User.create({ username, email, password, role: assignedRole });
    const token = user.generateToken();

    res.cookie('token', token, cookieOptions);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user:    { id: user._id, username: user.username, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/login */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new ExpressError(400, 'Username and password are required'));
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return next(new ExpressError(401, 'Invalid username or password'));
    }

    const token = user.generateToken();
    res.cookie('token', token, cookieOptions);

    res.json({
      success: true,
      message: 'Login successful',
      user:    { id: user._id, username: user.username, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/logout */
exports.logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
  res.json({ success: true, message: 'Logged out successfully' });
};

/** GET /api/auth/me */
exports.getMe = (req, res) => {
  const { _id: id, username, email, role } = req.user;
  res.json({ success: true, user: { id, username, email, role } });
};
