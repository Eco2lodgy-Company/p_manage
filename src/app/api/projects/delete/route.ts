import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: "Le paramètre 'id' est requis" },
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

            // Supprimer le projet
            await client.query("DELETE FROM projets WHERE id = $1", [id]);

            return NextResponse.json(
                { message: "Projet supprimé avec succès" },
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