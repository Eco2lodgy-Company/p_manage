
import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Step 1: Log environment variables
    console.log("DEBUG: SENDGRID_API_KEY exists:", !!process.env.SENDGRID_API_KEY);
    console.log("DEBUG: SENDGRID_VERIFIED_SENDER:", process.env.SENDGRID_VERIFIED_SENDER || "asaleydiori@gmail.com");
    console.log("DEBUG: NODE_ENV:", process.env.NODE_ENV);

    // Step 2: Validate SendGrid configuration
    if (!process.env.SENDGRID_API_KEY) {
      console.error("ERROR: SENDGRID_API_KEY is not set in environment variables");
      return NextResponse.json(
        {
          success: false,
          error: "Configuration SendGrid invalide",
          details: process.env.NODE_ENV === "development" ? "SENDGRID_API_KEY is not set in .env.local" : undefined,
        },
        { status: 500 }
      );
    }

    // Step 3: Parse and validate request body
    const body = await request.json();
    const { email, token, project_id } = body;

    if (!email || !token || !project_id) {
      console.error("ERROR: Missing required fields", { email, token, project_id });
      return NextResponse.json(
        { error: "Tous les champs sont requis (email, token, project_id)" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error("ERROR: Invalid email format:", email);
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Step 4: Configure SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Step 5: Send email first
    const msg = {
      to: email,
      from: process.env.SENDGRID_VERIFIED_SENDER || "asaleydiori@gmail.com",
      subject: "Invitation à un projet",
      text: `Vous avez été invité à rejoindre un projet. Acceptez via ce lien : http://alphatek.fr/invite?token=${token}`,
      html: `<p>Vous avez été invité à rejoindre un projet.</p><p><a href="http://alphatek.fr/invite?token=${token}">Acceptez l'invitation</a></p>`,
    };

    try {
      console.log("DEBUG: Attempting to send email to:", email);
      const sendResult = await sgMail.send(msg);
      console.log("DEBUG: Email send result:", JSON.stringify(sendResult, null, 2));
    } catch (emailError) {
      console.error("ERROR: Failed to send email:", emailError);
      let errorDetails = "Erreur inconnue lors de l'envoi de l'email";
     
      return NextResponse.json(
        {
          success: false,
          error: "Échec de l'envoi de l'email",
          details: process.env.NODE_ENV === "development" ? errorDetails : undefined,
        },
        { status: 500 }
      );
    }

    // Step 6: Email sent successfully, proceed with database insertion
    console.log("DEBUG: Connecting to database");
    const client = await connectionPool.connect();

    try {
      // Check for duplicate invitation
      console.log("DEBUG: Checking for existing invitation");
      const checkQuery = `SELECT id FROM invitations WHERE email = $1 AND project_id = $2`;
      const checkResult = await client.query(checkQuery, [email, project_id]);

      if (checkResult.rows.length > 0) {
        console.error("ERROR: Duplicate invitation for email:", email, "project_id:", project_id);
        return NextResponse.json(
          { error: "Un invité avec cet email existe déjà pour ce projet" },
          { status: 409 }
        );
      }

      // Insert invitation
      console.log("DEBUG: Inserting invitation");
      await client.query("BEGIN");
      const insertQuery = `
        INSERT INTO invitations(email, token, project_id)
        VALUES($1, $2, $3)
        RETURNING email, token, project_id;
      `;
      const values = [email, token, project_id];
      const result = await client.query(insertQuery, values);

      await client.query("COMMIT");
      console.log("DEBUG: Invitation inserted successfully");

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
      console.error("ERROR: Database error:", dbError);
      throw dbError;
    } finally {
      console.log("DEBUG: Releasing database client");
      client.release();
    }
  } catch (error) {
    console.error("ERROR: Server error:", error);
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
