import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";
import * as bcrypt from 'bcrypt';

// Configuration
const SALT_ROUNDS = 10;

export async function POST(request: Request) {
    try {
        // Récupérer et valider les données
        const body = await request.json();
        const { nom, prenom, telephone, mail, password, role } = body;

        // Validation complète des données
        if (!nom || !prenom || !telephone || !mail || !password || !role) {
            return NextResponse.json(
                { error: "Tous les champs sont requis" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Le mot de passe doit contenir au moins 8 caractères" },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
            return NextResponse.json(
                { error: "Format d'email invalide" },
                { status: 400 }
            );
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const client = await connectionPool.connect();
        
        try {
            // Vérification si l'email existe déjà
            const checkQuery = `SELECT id FROM users WHERE mail = $1`;
            const checkResult = await client.query(checkQuery, [mail]);
            
            if (checkResult.rows.length > 0) {
                return NextResponse.json(
                    { error: "Un utilisateur avec cet email existe déjà" },
                    { status: 409 }
                );
            }

            // Insertion avec transaction
            await client.query('BEGIN');
            
            const insertQuery = `
                INSERT INTO users(nom, prenom, telephone, mail, password, role)
                VALUES($1, $2, $3, $4, $5, $6)
                RETURNING id, nom, prenom, mail, role;
            `;
            
            const values = [nom, prenom, telephone, mail, hashedPassword, role];
            const result = await client.query(insertQuery, values);
            
            await client.query('COMMIT');
            
            // Ne retournez jamais le mot de passe même hashé
            const userData = result.rows[0];
            
            return NextResponse.json(
                { 
                    success: true,
                    message: "Utilisateur créé avec succès",
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