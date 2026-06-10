import CommandLine from "../models/commandLine.model.js";
import Command from "../models/command.model.js";


const createCommand = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const cartId = req.body.cartId || null;

    let command;

    // 🧑‍💻 1 - CAS : utilisateur connecté
    if (userId) {
      command = await Command.findOne({ user: userId, status: "pending" });

      if (!command) {
        command = await Command.create({
          user: userId,
          status: "pending",
          items: [],
          totalAmount: 0,
        });
      }
    }

    // 👤 2 - CAS : visiteur avec cartId
    else if (cartId) {
      command = await Command.findOne({ cartId, status: "pending" });

      if (!command) {
        command = await Command.create({
          cartId,
          status: "pending",
          items: [],
          totalAmount: 0,
        });
      }
    }

    // ❌ 3 - Aucun moyen d’identifier la commande
    else {
      return res.status(400).json({
        message: "Aucun utilisateur connecté ni cartId fourni",
      });
    }

    return res.status(201).json({
      message: "Commande active récupérée/créée avec succès",
      commandId: command._id,
      command,
    });

  } catch (error) {
    console.error("❌ Erreur createCommand :", error);
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
};
 

/* ---------------------------------------------
   🟢 2 — Récupérer toutes les commandes
----------------------------------------------*/
const getAllCommands = async (req, res) => {
  try {
    const commands = await Command.find();
    return res.status(200).json(commands);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

/* ---------------------------------------------
   🟢 3 — Récupérer une commande par ID
----------------------------------------------*/
const getCommandById = async (req, res) => {
  try {
    const command = await Command.findById(req.params.id);

    if (!command) {
      return res.status(404).json({ message: "command doesn't exist" });
    }

    const commandLines = await CommandLine.find({ command: req.params.id })
      .populate("ref", "titre tome prix");

    const total = commandLines.reduce((sum, line) =>
      sum + line.ref.prix * line.quantity, 0);

    return res.status(200).json({
      ...command.toObject(),
      commandLines,
      total
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

/* ---------------------------------------------
   🟡 4 — Mettre à jour une commande
----------------------------------------------*/
const updateCommand = async (req, res) => {
  try {
    const { body } = req;

    if (!body) return res.status(400).json({ message: "No data in the request" });

    const { error } = CommandValidation(body).commandLineUpdate;
    if (error) return res.status(401).json(error.details[0].message);

    const updatedCommand = await Command.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );

    if (!updatedCommand) {
      return res.status(404).json({ message: "command doesn't exist" });
    }

    return res.status(200).json(updatedCommand);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

/* ---------------------------------------------
   🔴 5 — Supprimer une commande
----------------------------------------------*/
const deleteCommand = async (req, res) => {
  try {
    const command = await Command.findByIdAndDelete(req.params.id);

    if (!command) {
      return res.status(404).json({ message: "command doesn't exist" });
    }

    // OPTIONNEL : supprimer aussi ses commandLines
    await CommandLine.deleteMany({ command: req.params.id });

    return res.status(200).json({ message: "command has been deleted" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

/* ---------------------------------------------
   🔥 6 — Récupérer le panier PENDING de l’utilisateur
----------------------------------------------*/
const getPanier = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const cartId = req.query.cartId || null;

    let command;

    // CAS utilisateur connecté
    if (userId) {
      command = await Command.findOne({
        user: userId,
        status: "pending",
      }).populate({
        path: "items",
        populate: {
          path: "ref",
          select: "titre prix tome name alt",
        },
      });
    }

    // CAS visiteur sans compte
    else if (cartId) {
      command = await Command.findOne({
        cartId,
        status: "pending",
      }).populate({
        path: "items",
        populate: {
          path: "ref",
          select: "titre prix tome name alt",
        },
      });
    }

    // Aucun panier
    if (!command) {
      return res.status(200).json({
        commandId: null,
        total: 0,
        commandLines: [],
      });
    }

    // Calcul du total
    const total = command.items.reduce((sum, line) => {
      return sum + (line.ref?.prix || 0) * line.quantity;
    }, 0);

    // Mise à jour du totalAmount
    command.totalAmount = total;
    await command.save();

    return res.status(200).json({
      commandId: command._id,
      total,
      commandLines: command.items.map((line) => ({
        _id: line._id,
        quantity: line.quantity,
        ref: {
          _id: line.ref?._id,
          titre: line.ref?.titre,
          tome: line.ref?.tome,
          prix: line.ref?.prix,
          image: line.ref?.name, // 👍 CORRIGÉ
          alt: line.ref?.alt,
        },
      })),
    });
  } catch (error) {
    console.error("❌ Erreur getPanier :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/* ---------------------------------------------
   🟣 7 — Historique des commandes (déjà payées)
----------------------------------------------*/
const getMyCommandes = async (req, res) => {
  if (!req.user) {
    return res.status(403).json({ message: "Vous n'êtes pas autorisé" });
  }

  try {
    // 🟢 Correction : le statut d’une commande payée n’est PAS "false"
    const historique = await Command.find({
      user: req.user.id,
      status: "paid",
    });

    return res.status(200).json(historique);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

export {
  createCommand,
  getAllCommands,
  getCommandById,
  updateCommand,
  deleteCommand,
  getPanier,
  getMyCommandes
};
