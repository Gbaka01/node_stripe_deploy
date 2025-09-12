import User from "../models/user.model.js";
import Command from "../models/command.model.js";
import userValidation from "../validations/user.validation.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// --- REGISTER ---
const register = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res.status(400).json({ message: "No data in the request" });
    }

    const { error } = userValidation(body).userCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const searchUser = await User.findOne({ email: body.email });
    if (searchUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hash du mot de passe
    const salt = await bcrypt.genSalt(10);
    body.password = await bcrypt.hash(body.password, salt);

    // créer le panier associé
    const command = new Command();
    const user = new User(body);

    user.panier = command._id;
    command.user = user._id;

    await command.save();
    const newUser = await user.save();

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- LOGIN ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { error } = userValidation(req.body).userLogin;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d", // token expire en 1 jour
    });

    res.status(200).json({
      message: `${user.email} is connected`,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- GET ALL USERS ---
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // on masque le mot de passe
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- GET USER BY ID ---
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- UPDATE USER ---
const updateUser = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res.status(400).json({ message: "No data in the request" });
    }

    const { error } = userValidation(body).userUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // si mot de passe modifié, on le re-hash
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, body, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- DELETE USER ---
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { register, login, getAllUsers, getUserById, updateUser, deleteUser };












