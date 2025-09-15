import CommandLine from "../models/commandLine.model.js"
import Command from "../models/command.model.js"
import commandLineValidation from "../validations/commandLine.validation.js"
const createCommandLine = async (req, res) => {
  try {
    const { ref, quantity = 1, cartId } = req.body;

    if (!ref) {
      return res.status(400).json({ message: "Référence manquante" });
    }

    let command;

    if (req.user?.id) {
      // ✅ Cas 1 : utilisateur connecté
      command = await Command.findOne({ user: req.user.id, status: true });
      if (!command) {
        command = new Command({ user: req.user.id, status: true });
        await command.save();
      }
    } else if (cartId) {
      // ✅ Cas 2 : visiteur
      command = await Command.findOne({ cartId, status: true });
      if (!command) {
        command = new Command({ cartId, status: true });
        await command.save();
      }
    } else {
      return res
        .status(400)
        .json({ message: "Aucun utilisateur ou cartId fourni" });
    }

    // 🔎 Vérifier si la ligne existe déjà
    let commandLine = await CommandLine.findOne({
      command: command._id,
      ref,
    });

    if (commandLine) {
      commandLine.quantity += quantity;
    } else {
      commandLine = new CommandLine({
        command: command._id,
        ref,
        quantity,
      });
    }

    await commandLine.save();

    // 👉 Populate pour retourner directement les infos de l'article
    const populated = await commandLine.populate("ref", "titre prix tome");

    return res.status(201).json(populated);
  } catch (err) {
    console.error("❌ Erreur createCommandLine:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

const getAllCommandLines = async(req, res) => {
    try {
        const commandLines = await CommandLine.find()
        return res.status(200).json(commandLines)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server Error", error: error})
    }
}
const getCommandLineById = async(req,res) => {
    try {
        const commandLine = await CommandLine.findById(req.params.id)
        if(!commandLine){
            return res.status(404).json({message: "commandLine doesn't exist"})
        }
        return res.status(200).json(commandLine)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server error", error: error})
    }
}
const updateCommandLine = async(req,res) => {
    try {
        const {body} = req
        if(!body){
            return res.status(400).json({message: "No data in the request"})
        }
        const {error} = commandLineValidation(body).commandLineUpdate
        if(error){
            return res.status(401).json(error.details[0].message)
        }
        const updatedCommandLine = await CommandLine.findByIdAndUpdate(req.params.id, body, {new: true})
        if(!updatedCommandLine){
            res.status(404).json({message: "commandLine doesn't exist"})
        }
        return res.status(200).json(updatedCommandLine)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server error", error: error})
    }
}
const deleteCommandLine = async(req, res) => {
    try {
        const commandLine = await CommandLine.findByIdAndDelete(req.params.id)
        if(!commandLine){
            return res.status(404).json({message: "commandLine doesn't exist"})
        }
        return res.status(200).json({message: "commandLine has been deleted"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server error", error: error})
    }
}
export { createCommandLine, getAllCommandLines, getCommandLineById, updateCommandLine, deleteCommandLine }