import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";


export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const client = await connectionPool.connect();

    try {
      const result = await client.query(
        "SELECT id, role,mail, password FROM users WHERE mail = $1",
        [email]
      );

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
    const id = user.id;
    const role = user.role;

      // Libérer la connexion
      client.release();

      // Retourner le token
      return NextResponse.json(
        { id,role, message: "Connexion réussie" },
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