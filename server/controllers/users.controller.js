import User from '../models/User.js';

// GET /api/users — admin only
export const listUsers = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments(filter)
    ]);

    return res.status(200).json({ success: true, total, page: parseInt(page), users });
  } catch (error) {
    next(error);
  }
};

// POST /api/users — admin only
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, specialization, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }
    const user = await User.create({ name, email, password, role, specialization, phone });
    return res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id
export const updateUser = async (req, res, next) => {
  try {
    const { name, specialization, phone, role } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (phone !== undefined) updateData.phone = phone;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id — deactivate
export const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, message: 'User deactivated.', user });
  } catch (error) {
    next(error);
  }
};
