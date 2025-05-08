import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, title, description, start_date, end_date, assign_to } = body;

        if (!id) {
            return NextResponse.json(
                { error: "L'ID du projet est requis" },
                { status: 400 }
            );
        }

        const client = await connectionPool.connect();

        try {
            // Vérifier que le projet existe
            const checkResult = await client.query(
                "SELECT id FROM projets WHERE id = $1",
                [id]
            );

            if (checkResult.rows.length === 0) {
                return NextResponse.json(
                    { error: "Projet non trouvé" },
                    { status: 404 }
                );
            }

            // Construction dynamique de la requête
            const updates = [];
            const values = [];
            let paramIndex = 1;

            if (title !== undefined) {
                updates.push(`title = $${paramIndex}`);
                values.push(title);
                paramIndex++;
            }

            if (description !== undefined) {
                updates.push(`description = $${paramIndex}`);
                values.push(description);
                paramIndex++;
            }

            if (start_date !== undefined) {
                updates.push(`start_date = $${paramIndex}`);
                values.push(start_date);
                paramIndex++;
            }

            if (end_date !== undefined) {
                updates.push(`end_date = $${paramIndex}`);
                values.push(end_date);
                paramIndex++;
            }

            if (assign_to !== undefined) {
                updates.push(`assign_to = $${paramIndex}`);
                values.push(assign_to);
                paramIndex++;
            }

            if (updates.length === 0) {
                return NextResponse.json(
                    { error: "Aucune donnée à mettre à jour" },
                    { status: 400 }
                );
            }

            values.push(id);
            const query = `
                UPDATE projets
                SET ${updates.join(", ")}
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const result = await client.query(query, values);
            const updatedProject = result.rows[0];

            return NextResponse.json(
                { 
                    message: "Projet mis à jour avec succès",
                    data: updatedProject 
                },
                { status: 200 }
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