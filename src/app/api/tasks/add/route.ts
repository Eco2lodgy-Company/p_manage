import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { titre, description, id_projet, start_date, end_date, precedence, asign_to } = body;

        // Validation minimale
        if (!titre || !id_projet) {
            return NextResponse.json(
                { error: "Le titre et l'ID du projet sont requis" },
                { status: 400 }
            );
        }

        const client = await connectionPool.connect();

        try {
            const result = await client.query(
                `INSERT INTO taches 
                (titre, description, id_projet, start_date, end_date, precedence, asign_to)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                [titre, description, id_projet, start_date, end_date, precedence || [], asign_to]
            );

            const newTache = result.rows[0];

            return NextResponse.json(
                { 
                    message: "Tâche créée avec succès",
                    data: newTache 
                },
                { status: 201 }
            );

        } finally {
            client.release();
        }

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Erreur serveur" },
            { status: 500 }
        );
    }
}