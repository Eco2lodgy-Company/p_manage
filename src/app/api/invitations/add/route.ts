
import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import type { NextRequest } from "next/server";
import nodemailer from 'nodemailer';
import { toast } from "sonner";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token, project_id } = body;

    
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Ou un autre service (yahoo, outlook, etc.)
      auth: {
        user: 'asaleydiori@gmail.com',
        pass: 'Diori@1177', // Attention aux applications tierces, utilisez un mot de passe d'application
      },
    });
    try{
        await transporter.sendMail({
            from: 'asaleydiori@gmail.com',
            to: email,
            subject: 'Invitation à rejoindre le projet',
            text: `Vous avez été invité à rejoindre le projet avec l'ID ${project_id}. Voici votre token: ${token}`,
        });
        toast.success("Email envoyé avec succès");
    }catch(e){
        toast.error("Erreur lors de l'envoi de l'email");
        console.error("ERROR: Email sending error:", e);
        return NextResponse.json(
          { error: "Erreur lors de l'envoi de l'email" },)
    }


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
