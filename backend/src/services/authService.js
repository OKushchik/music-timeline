const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const cookieOptions = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   COOKIE_MAX_AGE_MS,
};

const generateToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const buildUserPayload = (user, extra = {}) => ({
  _id:      user._id,
  username: user.username,
  email:    user.email,
  stats:    user.stats,
  ...extra,
});

const registerUser = async ({ username, email, password }) => {
  const user  = await User.create({ username, email, password });
  const token = generateToken(user._id);
  return { user, token, payload: buildUserPayload(user, { token }) };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  const isPasswordValid = user && await user.matchPassword(password);
  if (!isPasswordValid) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }
  const token = generateToken(user._id);
  return { user, token, payload: buildUserPayload(user, { token }) };
};

const createGuestUser = async () => {
  const guestUsername = `Guest_${nanoid(5)}`;
  const guestEmail    = `${guestUsername}@guest.local`;
  const user  = await User.create({ username: guestUsername, email: guestEmail, isGuest: true });
  const token = generateToken(user._id);
  return {
    user,
    token,
    payload: { _id: user._id, username: user.username, isGuest: true, token },
  };
};

const getUserById = async (id) => User.findById(id);

module.exports = { registerUser, loginUser, createGuestUser, getUserById, cookieOptions };

