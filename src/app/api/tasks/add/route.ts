import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { titre, description, id_projet, start_date, echeance,end_date, precedence, asign_to } = body;

        const client = await connectionPool.connect();

        try {
            const result = await client.query(
                `INSERT INTO taches 
                (titre, description, start_date, echeance)
                VALUES ($1, $2, $3, $4)
                RETURNING *`,
                [titre, description, start_date,echeance ]
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