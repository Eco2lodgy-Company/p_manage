import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, titre, description, id_projet, start_date, echeance, precedence, asign_to } = body;

        if (!id) {
            return NextResponse.json(
                { error: "L'ID de la tâche est requis" },
                { status: 400 }
            );
        }

        const client = await connectionPool.connect();

        try {
            // Vérifier que la tâche existe
            const tacheExists = await client.query(
                "SELECT id FROM taches WHERE id = $1",
                [id]
            );

            if (tacheExists.rows.length === 0) {
                return NextResponse.json(
                    { error: "Tâche non trouvée" },
                    { status: 404 }
                );
            }

            // Construction dynamique de la requête
            const updates = [];
            const values = [];
            let paramIndex = 1;

            if (titre !== undefined) {
                updates.push(`titre = $${paramIndex}`);
                values.push(titre);
                paramIndex++;
            }

            if (description !== undefined) {
                updates.push(`description = $${paramIndex}`);
                values.push(description);
                paramIndex++;
            }

            if (id_projet !== undefined) {
                // Vérifier que le nouveau projet existe
                const projetExists = await client.query(
                    "SELECT id FROM projets WHERE id = $1",
                    [id_projet]
                );

                if (projetExists.rows.length === 0) {
                    return NextResponse.json(
                        { error: "Le projet spécifié n'existe pas" },
                        { status: 404 }
                    );
                }

                updates.push(`id_projet = $${paramIndex}`);
                values.push(id_projet);
                paramIndex++;
            }

            if (start_date !== undefined) {
                updates.push(`start_date = $${paramIndex}`);
                values.push(start_date);
                paramIndex++;
            }

            if (echeance !== undefined) {
                updates.push(`echeance = $${paramIndex}`);
                values.push(echeance);
                paramIndex++;
            }

            if (precedence !== undefined) {
                updates.push(`precedence = $${paramIndex}`);
                values.push(precedence);
                paramIndex++;
            }

            if (asign_to !== undefined) {
                updates.push(`asign_to = $${paramIndex}`);
                values.push(asign_to);
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
                UPDATE taches
                SET ${updates.join(", ")}
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const result = await client.query(query, values);
            const updatedTache = result.rows[0];

            return NextResponse.json(
                { 
                    message: "Tâche mise à jour avec succès",
                    data: updatedTache 
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