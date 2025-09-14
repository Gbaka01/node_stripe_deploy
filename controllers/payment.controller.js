import dotenv from "dotenv"
import Command from '../models/command.model.js'
import CommandLine from "../models/commandLine.model.js";
dotenv.config()
export const createCheckoutSession = async (req, res) => {
    try {
        const {id} = req.params
        const command = await Command.findById(id)
    if(!command){
        return res.status(404).json({message: "La commande n'existe pas"})
    }
    const commandLines = await CommandLine.find({command: id}).populate("ref", "prix titre")
    let items = []
    if(commandLines.length == 0){
        return res.status(400).json({message: "Le panier est vide"})
    }
    commandLines.map(line => {
        let item = {
             price_data: {
             currency: "eur",
             product_data: { name: line.ref.titre },
             unit_amount: line.ref.prix * 100
             },
             quantity: line.quantity
        }
        items.push(item)
    })
} catch (error) {
        res.status(500).json({ error: error.message });
    }
};