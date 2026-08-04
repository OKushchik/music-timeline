const { registerUser, loginUser, createGuestUser, getUserById, cookieOptions } = require('../services/authService');

// @desc  Register a new user
// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const { payload, token } = await registerUser({ username, email, password });
    res.cookie('token', token, cookieOptions);
    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
};

// @desc  Login existing user
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { payload, token } = await loginUser({ email, password });
    res.cookie('token', token, cookieOptions);
    res.json(payload);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// @desc  Guest login (no password)
// @route POST /api/auth/guest
const guestLogin = async (req, res, next) => {
  try {
    const { payload, token } = await createGuestUser();
    res.cookie('token', token, cookieOptions);
    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
};

// @desc  Logout
// @route POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

// @desc  Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, guestLogin, logout, getMe };
