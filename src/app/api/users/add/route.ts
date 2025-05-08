import connectionPool from "@/lib/db"
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // Récupérer les données du corps de la requête
        const body = await request.json();
        const { nom, prenom, telephone, mail, password, role } = body;

        // Valider que tous les champs requis sont présents
        if (!nom || !prenom || !telephone || !mail || !password || !role) {
            return NextResponse.json(
                { error: "Tous les champs (nom, prenom, telephone, mail, password, role) sont requis" },
                { status: 400 }
            );
        }

        const client = await connectionPool.connect();
        
        // Requête SQL paramétrée pour éviter les injections SQL
        const query = `
            INSERT INTO users(nom, prenom, telephone, mail, password, role)
            VALUES($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        
        const values = [nom, prenom, telephone, mail, password, role];
        
        // Exécuter réellement la requête
        const result = await client.query(query, values);
        const data = result.rows[0]; // Récupérer le premier élément inséré
        
        client.release();
        
        return NextResponse.json({ 
            message: "Utilisateur créé avec succès",
            data: data 
        }, { status: 201 });
        
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error connecting to db:", error.message);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }
        console.error("An unknown error occurred");
        return NextResponse.json(
            { error: "An unknown error occurred" },
            { status: 500 }
        );
    }
}