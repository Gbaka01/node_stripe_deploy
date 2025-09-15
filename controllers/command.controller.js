import Command from "../models/command.model.js"
import CommandLine from "../models/commandLine.model.js"
import commandValidation from "../validations/command.validation.js"
const createCommand = async(req,res)=>{
    try {
        const {body} = req
        if(!body){
            return res.status(400).json({message: "no data in the request"})
        }
        const {error} = commandValidation(body).commandCreate
        if(error){
            return res.status(401).json(error.details[0].message)
        }
        const command = new Command(body)
        const newCommand = await command.save()
        return res.status(201).json(newCommand)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server error", error: error})
    }
}
const getAllCommands = async(req, res) => {
    try {
        const commands = await Command.find()
        return res.status(200).json(commands)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server Error", error: error})
    }
}
const getCommandById = async(req,res) => {
    try {
        const command = await Command.findById(req.params.id)
        if(!command){
            return res.status(404).json({message: "command doesn't exist"})
        }
        const commandLines = await CommandLine.find({command: req.params.id}).populate("ref", "prix")
        const total = commandLines.reduce((sum, line)=>{
            return sum + line.ref.prix * line.quantity
        }, 0)
        return res.status(200).json({...command.toObject(), commandLines, total})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server error", error: error})
    }
}
const updateCommand = async(req,res) => {
    try {
        const {body} = req
        if(!body){
            return res.status(400).json({message: "No data in the request"})
        }
        const {error} = commandValidation(body).commandUpdate
        if(error){
            return res.status(401).json(error.details[0].message)
        }
        const updatedCommand = await Command.findByIdAndUpdate(req.params.id, body, {new: true})
        if(!updatedCommand){
            res.status(404).json({message: "command doesn't exist"})
        }
        return res.status(200).json(updatedCommand)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server error", error: error})
    }
}
const deleteCommand = async(req, res) => {
    try {
        const command = await Command.findByIdAndDelete(req.params.id)
        if(!command){
            return res.status(404).json({message: "command doesn't exist"})
        }
        return res.status(200).json({message: "command has been deleted"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server error", error: error})
    }
}
const getPanier = async (req, res) => {
  try {
    let command;

    if (req.user) {
      // 🔑 Cas 1 : utilisateur connecté
      command = await Command.findOne({ user: req.user.id, status: true });

      if (!command) {
        command = new Command({ user: req.user.id, status: true });
        await command.save();
      }
    } else if (req.query.cartId) {
      // 🛒 Cas 2 : visiteur avec cartId
      command = await Command.findOne({ cartId: req.query.cartId, status: true });

      if (!command) {
        command = new Command({ cartId: req.query.cartId, status: true });
        await command.save();
      }
    } else {
      return res.status(400).json({ message: "Aucun utilisateur ou cartId fourni" });
    }
        const panier = await Command.findOne({user: req.user.id, status: true})
        if(!panier){
            return res.status(404).json({message: "panier doesn't exist"})
        }

    // 📦 On récupère les lignes associées
    const commandLines = await CommandLine.find({ command: command._id })
      .populate("ref", "titre tome prix");

    // 💶 Calcul du total
    const total = commandLines.reduce(
      (sum, line) => sum + (line.ref?.prix || 0) * line.quantity,
      0
    );

    // ✅ Réponse finale
 return res.status(200).json({...panier.toObject(), commandLines, total})
  } catch (error) {
    console.error("❌ Erreur getPanier:", error);
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
}
const getMyCommandes = async(req, res) => {
    if(!req.user){
        return res.status(403).json({message: "Vous n'êtes pas autorisé"})
    }
    try {
        const historique = await Command.find({user: req.user.id, status: false})
        return res.status(200).json(historique)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server error", error: error})
    }
}
export { createCommand, getAllCommands, getCommandById, updateCommand, deleteCommand, getPanier, getMyCommandes }///
