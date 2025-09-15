import CommandLine from "../models/commandLine.model.js"
import Command from "../models/command.model.js"
import commandLineValidation from "../validations/commandLine.validation.js"
const createCommandLine = async(req,res)=>{
    try {
        const {body, user} = req
        const command = await Command.findOne({user: user.id, status: true})
        console.log(body)
        if(!body){
            return res.status(400).json({message: "no data in the request"})
        }
        const line = {...body, command: command._id.toString()}
        console.log(line)
        const {error} = commandLineValidation(line).commandLineCreate
        if(error){
            return res.status(401).json(error.details[0].message)
        }
        const commandLine = new CommandLine(line)
        const newCommandLine = await commandLine.save()
        return res.status(201).json(newCommandLine)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server error", error: error})
    }
}
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