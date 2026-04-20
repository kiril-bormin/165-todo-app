const bcrypt = require('bcrypt');

const cleanUser = (user) => {
  // eslint-disable-next-line no-unused-vars
  const { password, ...cleanedUser } = user.toObject();
  return cleanedUser;
};

const UserController = {
  createUser: async (req, res) => {
    const { email, password } = req.body;
    const { User } = req.app.locals.models;

    try {
      const user = new User({
        email: email.toLowerCase(),
        password: await bcrypt.hash(password, 8)
      });
      const result = await user.save();
      return res.status(201).json({ user: cleanUser(result) });
    } catch (error) {
      console.error('ADD USER: ', error);
      if (error.code === 11000) {
        return res.status(409).json({ message: 'Un compte avec cet email existe déjà !' });
      }
      return res.status(500).json({ message: "Erreur lors de l'inscription !" });
    }
  },
  getUser: async (req, res) => {
    const user_id = req.sub;
    const { User } = req.app.locals.models;

    try {
      const result = await User.findById(user_id).select('-password');
      if (result) {
        return res.status(200).json({ user: result });
      } else {
        return res.status(404);
      }
    } catch (error) {
      console.error('GET USER: ', error);
      return res.status(500);
    }
  },
  editUser: async (req, res) => {
    const user_id = req.sub;
    const data = req.body;
    const { User } = req.app.locals.models;

    try {
      const user = await User.findById(user_id);
      if (user) {
        user.name = data.name || null;
        user.address = data.address || null;
        user.zip = data.zip || null;
        user.location = data.location || null;
        await user.save();
        return res.status(200).json({ user: cleanUser(user) });
      } else {
        return res.status(404);
      }
    } catch (error) {
      console.error('UPDATE USER: ', error);
      return res.status(500);
    }
  },
  deleteCurrentUser: async (req, res) => {
    const user_id = req.sub;
    const { User } = req.app.locals.models;

    try {
      await User.findByIdAndDelete(user_id);
      return res.status(200).json({ id: user_id });
    } catch (error) {
      console.error('DELETE USER: ', error);
      return res.status(500);
    }
  }
};

module.exports = UserController;
