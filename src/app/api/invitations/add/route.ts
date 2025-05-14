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
                RETURNING id, nom, prenom, mail, role;
            `;
            
            const values = [email, token];
            const result = await client.query(insertQuery, values);
            
            await client.query('COMMIT');
            
            // Ne retournez jamais le mot de passe même hashé
            const userData = result.rows[0];
            
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