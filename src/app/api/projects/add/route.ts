import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, start_date, end_date, assign_to } = body;

        // Validation minimale
        if (!title) {
            return NextResponse.json(
                { error: "Le titre du projet est requis" },
                { status: 400 }
            );
        }

        const client = await connectionPool.connect();

        try {
            const result = await client.query(
                `INSERT INTO projets (title, description, start_date, end_date)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [title, description, start_date, end_date]
            );

            const newProject = result.rows[0];

            return NextResponse.json(
                { 
                    message: "Projet créé avec succès",
                    data: newProject 
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