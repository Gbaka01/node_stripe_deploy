import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Accès non autorisé" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // on peut stocker seulement l’id ou l’utilisateur entier
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Utilisateur non trouvé" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: "Token invalide" });
    }
};

