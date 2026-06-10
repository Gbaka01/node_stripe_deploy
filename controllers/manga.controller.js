import Manga from "../models/manga.model.js";
import Image from "../models/image.model.js";
import mangaValidation from "../validations/manga.validation.js";

// ------------------------------------------------------------
// 🟢 1. Créer un manga
// ------------------------------------------------------------
const createManga = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res.status(400).json({ message: "Aucune donnée reçue" });
    }

    const { error } = mangaValidation(body).mangaCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const manga = new Manga(body);
    const newManga = await manga.save();
    return res.status(201).json(newManga);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ------------------------------------------------------------
// 🟢 2. Récupérer tous les mangas (URL images complètes)
// ------------------------------------------------------------
const getAllMangas = async (req, res) => {
  try {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");

    const mangas = await Manga.find().populate("images", "name alt");

    if (!mangas || mangas.length === 0) {
      return res.status(200).json([]);
    }

    const formattedMangas = mangas.map((manga) => ({
      ...manga.toObject(),
      images: manga.images.map((img) => ({
        ...img.toObject(),
        url: `${protocol}://${host}/uploads/${encodeURIComponent(img.name)}`,
      })),
    }));

    return res.status(200).json(formattedMangas);

  } catch (error) {
    console.error("❌ Erreur getAllMangas :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ------------------------------------------------------------
// 🟢 3. Récupérer un manga par ID
// ------------------------------------------------------------
const getMangaById = async (req, res) => {
  try {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");

    const manga = await Manga.findById(req.params.id).populate(
      "images",
      "name alt"
    );

    if (!manga) {
      return res.status(404).json({ message: "Manga introuvable" });
    }

    const formattedManga = {
      ...manga.toObject(),
      images: manga.images.map((img) => ({
        ...img.toObject(),
        url: `${protocol}://${host}/uploads/${encodeURIComponent(img.name)}`,
      })),
    };

    return res.status(200).json(formattedManga);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ------------------------------------------------------------
// 🟡 4. Mettre à jour un manga
// ------------------------------------------------------------
const updateManga = async (req, res) => {
  try {
    const { body } = req;

    if (!body) {
      return res.status(400).json({ message: "Aucune donnée reçue" });
    }

    const { error } = mangaValidation(body).mangaUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const updatedManga = await Manga.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );

    if (!updatedManga) {
      return res.status(404).json({ message: "Manga introuvable" });
    }

    return res.status(200).json(updatedManga);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ------------------------------------------------------------
// 🔴 5. Supprimer un manga
// ------------------------------------------------------------
const deleteManga = async (req, res) => {
  try {
    const manga = await Manga.findByIdAndDelete(req.params.id);

    if (!manga) {
      return res.status(404).json({ message: "Manga introuvable" });
    }

    return res.status(200).json({ message: "Manga supprimé avec succès" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ------------------------------------------------------------
// 🟣 6. Ajouter des images à un manga
// ------------------------------------------------------------
const addImages = async (req, res) => {
  try {
    const { body } = req;

    if (!body || !body.images) {
      return res.status(400).json({ message: "Pas de données dans la requête" });
    }

    const { error } = mangaValidation(body).mangaAddOrRemove;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Vérifie que le manga existe
    const exist = await Manga.findById(req.params.id);
    if (!exist) {
      return res.status(404).json({ message: "Manga introuvable" });
    }

    // Vérifie que chaque image existe
    for (const imageId of body.images) {
      const image = await Image.findById(imageId);
      if (!image) {
        return res.status(404).json({ message: `L'image ${imageId} n'existe pas` });
      }
    }

    const updatedManga = await Manga.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { images: { $each: body.images } } },
      { new: true }
    ).populate("images", "name alt");

    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");

    const formatted = {
      ...updatedManga.toObject(),
      images: updatedManga.images.map((img) => ({
        ...img.toObject(),
        url: `${protocol}://${host}/uploads/${encodeURIComponent(img.name)}`,
      })),
    };

    return res.status(200).json(formatted);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// ------------------------------------------------------------
// 🔵 7. Supprimer des images du manga
// ------------------------------------------------------------
const removeImages = async (req, res) => {
  try {
    const { body } = req;

    if (!body || !body.images) {
      return res.status(400).json({ message: "Pas de données dans la requête" });
    }

    const { error } = mangaValidation(body).mangaAddOrRemove;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const exist = await Manga.findById(req.params.id);
    if (!exist) {
      return res.status(404).json({ message: "Manga introuvable" });
    }

    const updatedManga = await Manga.findByIdAndUpdate(
      req.params.id,
      { $pull: { images: { $in: body.images } } },
      { new: true }
    ).populate("images", "name alt");

    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");

    const formatted = {
      ...updatedManga.toObject(),
      images: updatedManga.images.map((img) => ({
        ...img.toObject(),
        url: `${protocol}://${host}/uploads/${encodeURIComponent(img.name)}`,
      })),
    };

    return res.status(200).json(formatted);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

export {
  createManga,
  getAllMangas,
  getMangaById,
  updateManga,
  deleteManga,
  addImages,
  removeImages,
};

