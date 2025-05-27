import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

// Clé secrète pour JWT (devrait être dans une variable d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || "votre_clé_secrète";

export async function POST(request: Request) {
  try {
    // Récupérer les données du body
    const { email, password } = await request.json();

    // Vérifier que les champs sont fournis
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Connexion à la base de données
    const client = await connectionPool.connect();

    try {
      // Requête pour trouver l'utilisateur
      const result = await client.query(
        "SELECT id, email, password FROM users WHERE email = $1",
        [email]
      );

      // Vérifier si l'utilisateur existe
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Email ou mot de passe incorrect" },
          { status: 401 }
        );
      }

      const user = result.rows[0];

      // Vérifier le mot de passe
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return NextResponse.json(
          { error: "Email ou mot de passe incorrect" },
          { status: 401 }
        );
      }

      // Générer un token JWT
    //   const token = jwt.sign(
    //     { userId: user.id, email: user.email },
    //     JWT_SECRET,
    //     { expiresIn: "1h" }
    //   );

      // Libérer la connexion
      client.release();

      // Retourner le token
      return NextResponse.json(
        {  message: "Connexion réussie" },
        { status: 200 }
      );
    } catch (error) {
      client.release();
      throw error;
    }
  } catch (error) {
    console.error("Erreur de connexion:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}