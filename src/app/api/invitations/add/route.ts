
import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import type { NextRequest } from "next/server";
import { toast } from "sonner";

export async function POST(request: NextRequest) {
  try {
    // Debug: Log environment variable status
    console.log("Environment check: SENDGRID_API_KEY exists:", !!process.env.SENDGRID_API_KEY);
    console.log("Environment check: SENDGRID_VERIFIED_SENDER:", process.env.SENDGRID_VERIFIED_SENDER || "asaleydiori@gmail.com");

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

    // Vérifier la présence de la clé API SendGrid
    if (!process.env.SENDGRID_API_KEY) {
      console.error("SENDGRID_API_KEY is not set in environment variables");
      console.error("SENDGRID_VERIFIED_SENDER:", process.env.SENDGRID_API_KEY || "");
      return NextResponse.json(
        {
          success: false,
          error: "Configuration SendGrid invalide",
          details: process.env.NODE_ENV === "development" ? "SENDGRID_API_KEY is not set" : undefined,
        },
        { status: 500 }
      );
    }

    // Configurer SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// Préparer l'email
    const msg = {
      to: email,
      from:"asaleydiori@gmail.com",
      subject: "Invitation à un projet",
      text: `Vous avez été invité à rejoindre un projet. Acceptez via ce lien : http://alphatek.fr/invite?token=${token}`,
      html: `<p>Vous avez été invité à rejoindre un projet.</p><p><a href="http://alphatek.fr/invite?token=${token}">Acceptez l'invitation</a></p>`,
    };

    // Envoyer l'email avant l'insertion
    try {
      console.log("Attempting to send email to:", email);
      const sendResult = await sgMail.send(msg);
      console.log("Email send result:", JSON.stringify(sendResult, null, 2));
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de l'email:", emailError);
      let errorDetails = "Erreur inconnue lors de l'envoi de l'email";
      if (typeof emailError === "object" && emailError !== null && "response" in emailError) {
        const err = emailError as { response?: { body?: unknown } };
        errorDetails = JSON.stringify(err.response?.body, null, 2);
        console.error("Détails SendGrid:", errorDetails);
      }
      return NextResponse.json(
        {
          success: false,
          error: "Échec de l'envoi de l'email",
          details: process.env.NODE_ENV === "development" ? errorDetails : undefined,
        },
        { status: 500 }
      );
    }

    // Si l'email est envoyé, procéder à l'insertion
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

      // Commit la transaction
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
        details: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
