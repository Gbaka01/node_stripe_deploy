import express from "express"
import cors from "cors"
import db from "./db/db.js"
import path from "node:path";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import imageRoutes from "./routes/image.route.js"
import userRoutes from "./routes/user.route.js"
import mangaRoutes from "./routes/manga.route.js";
import commandRoutes from "./routes/command.route.js";
import commandLineRoutes from "./routes/commandLine.route.js";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()



app.use(cors());


app.use(express.json())
const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`le serveur est démarré sur le port ${port}`)
});

// démarrage de la connexion à la bdd
db()

// Dossier "uploads" rendu statique : cela permet de consulter les images stockées dans ce dossier depuis un navigateur en utilisant les uri en bdd
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes----------
app.use('/image', imageRoutes)
app.use('/user', userRoutes)
app.use('/commandline', commandLineRoutes);
app.use('/command', commandRoutes);
app.use('/manga', mangaRoutes);
