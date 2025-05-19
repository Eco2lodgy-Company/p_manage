import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';
import connectionPool from '@/lib/db'; // Modifiez ce chemin selon votre projet

import type { NextApiRequest, NextApiResponse } from 'next';
import { request } from 'http';

export  async function POST(req: NextRequest, res: NextResponse) {
    const body = await req.json();
 const { email, token, project_id } = body;
  try {
    // Étape 1 : Récupération des données du corps de la requête
    

    // Étape 2 : Validation des données
    if (!email || !token || !project_id) {
      return console.log({ error: 'Tous les champs sont requis (email, token, project_id)' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return console.error({ error: 'Format d\'email invalide' });
    }

    // Étape 3 : Envoi de l'email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        // user: process.env.EMAIL_USER,
        user: 'asaleydiori@gmail.com',
        // pass: process.env.EMAIL_PASSWORD,
        pass:"Diori@1177" // Mot de passe d'application Gmail
      },
    });

    try {
      await transporter.sendMail({
        from:"asaleydiori@gmail.com",
        to: email,
        subject: 'Invitation à rejoindre le projet',
        text: `Vous avez été invité à rejoindre le projet avec l'ID ${project_id}. Voici votre token: ${token}`,
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      return console.error({ error: 'Erreur lors de l\'envoi de l\'email' });
    }

    // Étape 4 : Connexion et insertion dans la base de données
    const client = await connectionPool.connect();

    try {
      await client.query('BEGIN');

      // Vérifiez si l'invitation existe déjà
      const checkQuery = `SELECT id FROM invitations WHERE email = $1 AND project_id = $2`;
      const checkResult = await client.query(checkQuery, [email, project_id]);

      if (checkResult.rows.length > 0) {
        return console.error({ error: 'Un invité avec cet email existe déjà pour ce projet' });
      }

      // Insérez la nouvelle invitation
      const insertQuery = `
        INSERT INTO invitations(email, token, project_id)
        VALUES($1, $2, $3)
        RETURNING email, token, project_id;
      `;
      const result = await client.query(insertQuery, [email, token, project_id]);
      await client.query('COMMIT');

      // Réponse en cas de succès
      return console.log({
        success: true,
        message: 'Invitation créée et email envoyé avec succès',
        data: result.rows[0],
      });
    } catch (dbError) {
      await client.query('ROLLBACK');
      console.error('Erreur lors de la gestion de la base de données:', dbError);
      return console.error({ error: 'Erreur lors de l\'insertion dans la base de données' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur serveur:', error);
    // res.json()
    return console.error({
      success: false,
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
    });
  }
}
