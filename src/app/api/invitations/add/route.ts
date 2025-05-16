import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

// Configuration
if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable is not set");
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Récupérer et valider les données
    const body = await request.json();
    const { email, token, project_id } = body;

    // Validation complète des données
    if (!email || !token || !project_id) {
      return NextResponse.json(
        { error: "Tous les champs sont requis (email, token, project_id)" },
        { status: 400 }
      );
    }

    // Valider le format de l'email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    const client = await connectionPool.connect();

    try {
      // Vérification si l'email existe déjà pour ce projet
      const checkQuery = `SELECT id FROM invitations WHERE email = $1 AND project_id = $2`;
      const checkResult = await client.query(checkQuery, [email, project_id]);

      if (checkResult.rows.length > 0) {
        return NextResponse.json(
          { error: "Un invité avec cet email existe déjà pour ce projet" },
          { status: 409 }
        );
      }

      // Insertion avec transaction
      await client.query("BEGIN");

      const insertQuery = `
        INSERT INTO invitations(email, token, project_id)
        VALUES($1, $2, $3)
        RETURNING email, token, project_id;
      `;
      const values = [email, token, project_id];
      const result = await client.query(insertQuery, values);

      // Envoyer l'email
      const msg = {
        to: email,
        from: "your_verified_email@domain.com", // Remplacer par votre email vérifié SendGrid
        subject: "Invitation à un projet",
        text: `Vous avez été invité à rejoindre un projet. Acceptez via ce lien : http://alphatek.fr/invite?token=${token}`,
        html: `<p>Vous avez été invité à rejoindre un projet.</p><p><a href="http://alphatek.fr/invite?token=${token}">Acceptez l'invitation</a></p>`,
      };

      try {
        await sgMail.send(msg);
        await client.query("COMMIT");
        const userData = result.rows[0];
        return NextResponse.json(
          {
            success: true,
            message: "Invitation créée et email envoyé avec succès",
            data: userData,
          },
          { status: 201 }
        );
      } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email:", emailError);
        await client.query("ROLLBACK");
        return NextResponse.json(
          {
            success: false,
            message: "Invitation créée mais email non envoyé",
            data: result.rows[0],
          },
          { status: 201 }
        );
      }
    } catch (dbError) {
      await client.query("ROLLBACK");
      throw dbError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur",
        details: process.env.NODE_ENV === "development" && typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : undefined,
      },
      { status: 500 }
    );
  }
}