import Manga from "../models/manga.model.js"
import Image from "../models/image.model.js"
import mangaValidation from "../validations/manga.validation.js"

const createManga = async(req,res)=>{
    try {
        const {body} = req
        if(!body){
            return res.status(400).json({message: "no data in the request"})
        }
        const {error} = mangaValidation(body).mangaCreate
        if(error){
            return res.status(401).json(error.details[0].message)
        }
        const manga = new Manga(body)
        const newManga = await manga.save()
        return res.status(201).json(newManga)        
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server error", error: error})
    }
}

const getAllMangas = async(req, res) => {
    try {
        const mangas = await Manga.find().populate("images", "name alt")
        return res.status(200).json(mangas)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server Error", error: error})
    }
}

const getMangaById = async(req,res) => {
    try {
        const manga = await Manga.findById(req.params.id).populate("images", "name alt")
        if(!manga){
            return res.status(404).json({message: "manga doesn't exist"})
        }
        return res.status(200).json(manga)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server error", error: error})
    }
}

const updateManga = async(req,res) => {
    try {
        const {body} = req
        if(!body){
            return res.status(400).json({message: "No data in the request"})
        }

        const {error} = mangaValidation(body).mangaUpdate
        if(error){
            return res.status(401).json(error.details[0].message)
        }
        const updatedManga = await Manga.findByIdAndUpdate(req.params.id, body, {new: true})
        if(!updatedManga){
            res.status(404).json({message: "manga doesn't exist"})
        }
        return res.status(200).json(updatedManga)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server error", error: error})
    }
}

const deleteManga = async(req, res) => {
    try {
        const manga = await Manga.findByIdAndDelete(req.params.id)
        if(!manga){
            return res.status(404).json({message: "manga doesn't exist"})
        }
        return res.status(200).json({message: "manga has been deleted"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Server error", error: error})
    }
}

const addImages = async(req, res) => {
    try {
        const {body} = req
        if(!body || !body.images){
            return res.status(400).json({message: "Pas de données dans la requête"})
        }

        const {error} = mangaValidation(body).mangaAddOrRemove
        if(error){
            return res.status(401).json(error.details[0].message)
        }

        for(let imageId of body.images){
            const image = await Image.findById(imageId)
            if(!image){
                return res.status(404).json({message: `l'image ${imageId} n'existe pas`})
            }
        }

        const manga = await Manga.findById(req.params.id)
        if(!manga){
            return res.status(404).json({message: `le manga ${req.params.id} n'existe pas`})
        }
        
        for(let imageId of body.images){
            if(!manga.images.includes(imageId)){
                manga.images = [...manga.images, imageId]
            }
        }
        
        const updatedManga = await Manga.findByIdAndUpdate(req.params.id, {images: manga.images}, {new: true})

        // ou directement sans le "for...of" précédent on peut utiliser une instruction de MongoDB
        // const updatedJeu = await Jeu.findByIdAndUpdate(req.params.id, { $addToSet: { images: { $each: body.images } } }, { new : true })
        return res.status(200).json(updatedManga)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const removeImages = async(req, res) => {
    try {
        const {body} = req
        if(!body || !body.images){
            return res.status(400).json({message: "Pas de données dans la requête"})
        }

        const {error} = mangaValidation(body).mangaAddOrRemove
        if(error){
            return res.status(401).json(error.details[0].message)
        }

        for(let imageId of body.images){
            const image = await Image.findById(imageId)
            if(!image){
                return res.status(404).json({message: `l'image ${imageId} n'existe pas`})
            }
        }

        const manga = await Manga.findById(req.params.id)
        if(!manga){
            return res.status(404).json({message: `le manga ${req.params.id} n'existe pas`})
        }
        console.log(manga.images)
        const updatedManga = await Manga.findByIdAndUpdate(req.params.id, { $pull: { images: { $in: body.images } } }, { new : true })
        return res.status(200).json(updatedManga)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Erreur serveur", error: error})
    }
}


export { createManga, getAllMangas, getMangaById, updateManga, deleteManga, addImages, removeImages }