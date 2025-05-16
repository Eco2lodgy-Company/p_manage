
import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import type { NextRequest } from "next/server";

// Configuration
if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable is not set");
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

      // Commit la transaction avant d'envoyer l'email
      await client.query("COMMIT");

      // Envoyer l'email
      let emailSent = false;
      const msg = {
        to: email,
        from: process.env.SENDGRID_VERIFIED_SENDER || "your_verified_email@domain.com", // Remplacer par votre email vérifié SendGrid
        subject: "Invitation à un projet",
        text: `Vous avez été invité à rejoindre un projet. Acceptez via ce lien : http://alphatek.fr/invite?token=${token}`,
        html: `<p>Vous avez été invité à rejoindre un projet.</p><p><a href="http://alphatek.fr/invite?token=${token}">Acceptez l'invitation</a></p>`,
      };

      try {
        await sgMail.send(msg);
        emailSent = true;
      } catch (emailError:any) {
        console.error("Erreur lors de l'envoi de l'email:", emailError);
        // Inclure les détails de l'erreur SendGrid en mode développement
        if (process.env.NODE_ENV === "development" && emailError.response) {
          console.error("Détails SendGrid:", emailError.response.body);
        }
      }

      const userData = result.rows[0];
      return NextResponse.json(
        {
          success: true,
          message: emailSent
            ? "Invitation créée et email envoyé avec succès"
            : "Invitation créée mais email non envoyé",
          data: userData,
        },
        { status: 201 }
      );
    } catch (dbError) {
      await client.query("ROLLBACK");
      console.error("Erreur base de données:", dbError);
      throw dbError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur",
        details:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}