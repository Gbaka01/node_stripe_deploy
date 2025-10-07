import Image from "../models/image.model.js"
import imageValidation from "../validations/image.validation.js"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const createImage = async (req, res) => {
  try {
    const { body } = req
    if (!body) {
      if (req.file) fs.unlinkSync("./uploads/" + req.file.filename)
      return res.status(400).json({ message: "Aucune donnée dans la requête" })
    }

    if (req.file) {
      // ✅ Correction : détection du protocole même derrière un proxy (Render, Nginx, etc.)
      const protocol = req.headers["x-forwarded-proto"] || req.protocol

      // ✅ On construit une URL HTTPS complète et cohérente
      body.name = `${protocol}://${req.get("host")}/uploads/${req.file.filename}`
    }

    // ✅ Correction de la validation
    const { error } = imageValidation(body).imageCreate
    if (error) {
      if (req.file) fs.unlinkSync("./uploads/" + req.file.filename)
      return res.status(400).json({ message: error.details[0].message })
    }

    const image = new Image(body)
    const newImage = await image.save()
    return res.status(201).json(newImage)
  } catch (error) {
    console.error(error)
    if (req.file) fs.unlinkSync("./uploads/" + req.file.filename)
    return res.status(500).json({ message: "Erreur serveur", error })
  }
}

const getAllImages = async (req, res) => {
  try {
    const images = await Image.find()
    return res.status(200).json(images)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Erreur serveur", error })
  }
}

const getImageById = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id)
    if (!image) {
      return res.status(404).json({ message: "Image inexistante" })
    }
    return res.status(200).json(image)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Erreur serveur", error })
  }
}

const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id)
    if (!image) {
      return res.status(404).json({ message: "Image inexistante" })
    }

    if (image.nom) {
      const filename = image.nom.split("/").at(-1)
      const oldPath = path.join(__dirname, "../uploads/", filename)
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
    }

    await image.deleteOne()
    return res.status(200).json({ message: "Image supprimée" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Erreur serveur", error })
  }
}

export { createImage, getAllImages, getImageById, deleteImage }
