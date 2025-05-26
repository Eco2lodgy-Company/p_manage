import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";


// Schéma de validation des données d'entrée


// Interface pour la réponse
interface LoginResponse {
  token?: string;
  error?: string;
}

// Clé secrète pour JWT (devrait être dans une variable d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || "votre_clé_secrète";

// POST pour gérer le login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

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

     const { id } = user["id"];

      // Libérer la connexion
      client.release();

      // Retourner le token
      return NextResponse.json(
        { id, message: "Connexion réussie" },
        { status: 200 }
      );
    } catch (error) {
      client.release();
      throw error;
    }
  } catch (error) {
    // Gestion des erreurs
    
    if (error instanceof Error) {
      console.error("Erreur de connexion:", error.message);
      return NextResponse.json(
        { error: "Erreur serveur" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Une erreur inconnue s'est produite" },
      { status: 500 }
    );
  }
}