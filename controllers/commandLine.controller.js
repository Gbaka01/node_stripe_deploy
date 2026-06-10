import CommandLine from "../models/commandLine.model.js"
import Command from "../models/command.model.js"
import commandLineValidation from "../validations/commandLine.validation.js"
const createCommandLine = async (req, res) => {
  try {
    const { ref, quantity = 1, cartId } = req.body;
    const userId = req.user?.id || null;

    if (!ref) {
      return res.status(400).json({ message: "Référence manquante" });
    }

    let command;

    // CAS utilisateur connecté
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

    // CAS visiteur
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

    else {
      return res.status(400).json({
        message: "Aucun utilisateur connecté ni cartId fourni",
      });
    }

    // Vérifier si la ligne existe déjà
    let existingLine = await CommandLine.findOne({
      command: command._id,
      ref,
    });

    if (existingLine) {
      existingLine.quantity += quantity;
      await existingLine.save();

      const populated = await existingLine.populate("ref", "titre prix tome name alt");
      return res.status(200).json(populated);
    }

    // Nouvelle ligne
    const newLine = await CommandLine.create({
      ref,
      command: command._id,
      quantity,
    });

    command.items.push(newLine._id);
    await command.save();

    const populated = await newLine.populate("ref", "titre prix tome name alt");

    return res.status(201).json(populated);
  } catch (error) {
    console.error("❌ Erreur createCommandLine :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
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