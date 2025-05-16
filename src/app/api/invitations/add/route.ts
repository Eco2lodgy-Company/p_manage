import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";
import * as bcrypt from 'bcrypt';

// Configuration
const SALT_ROUNDS = 10;

export async function POST(request: Request) {
    try {
        // Récupérer et valider les données
        const body = await request.json();
        const { email, token } = body;

        // Validation complète des données
        if (!email || !token ) {
            return NextResponse.json(
                { error: "Tous les champs sont requis" },
                { status: 400 }
            );
        }

    

        const client = await connectionPool.connect();
        
        try {
            // Vérification si l'email existe déjà
            const checkQuery = `SELECT id FROM invitations WHERE email = $1`;
            const checkResult = await client.query(checkQuery, [email]);
            
            if (checkResult.rows.length > 0) {
                return NextResponse.json(
                    { error: "Un invité avec cet email existe déjà" },
                    { status: 409 }
                );
            }

            // Insertion avec transaction
            await client.query('BEGIN');
            
            const insertQuery = `
                INSERT INTO invitations(email, token)
                VALUES($1, $2)
                RETURNING email, token;
            `;
            
            const values = [email, token];
            const result = await client.query(insertQuery, values);
            
            await client.query('COMMIT');
            
            // Ne retournez jamais le mot de passe même hashé
            const userData = result.rows[0];
            const sgMail = require('@sendgrid/mail')
                    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
                    console.log(process.env.SENDGRID_API_KEY)
                    const msg = {
                    to: email, // Change to your recipient
                    from: 'asaleydiori@gmail.com', // Change to your verified sender
                    subject: 'Invitation a un projet',
                    text: 'and easy to do anywhere, even with Node.js',
                    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
                    }
                    sgMail
                    .send(msg)
                    .then(() => {
                        console.log('Email sent')
                    })
                    .catch((error: Error) => {
                        console.error(error)
                    })
            
            return NextResponse.json(
                { 
                    success: true,
                    message: "invitation créé avec succès",
                    data: userData 
                }, 
                { status: 201 }
            );
            
        } catch (dbError) {
            await client.query('ROLLBACK');
            throw dbError;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error("Erreur:", error);
        
        if (error instanceof Error) {
            return NextResponse.json(
                { 
                    success: false,
                    error: "Erreur serveur",
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                },
                { status: 500 }
            );
        }
        
        return NextResponse.json(
            { 
                success: false,
                error: "Erreur inconnue" 
            },
            { status: 500 }
        );
    }
}