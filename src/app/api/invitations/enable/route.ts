import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
    try {
        // Récupérer l'ID depuis les query params ou le body
        const { searchParams } = new URL(request.url);
        let id = searchParams.get('id');
        
        // Si l'ID n'est pas dans les query params, vérifier le body
        if (!id) {
            const body = await request.json();
            id = body.id;
        }

        // Validation de l'ID
        if (!id) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "L'ID utilisateur est requis (peut être fourni dans les query params ou le body)" 
                },
                { status: 400 }
            );
        }

        const client = await connectionPool.connect();

        try {
            await client.query('BEGIN');

            // 1. Vérifier que l'utilisateur existe
            const checkUserQuery = 'SELECT id FROM users WHERE id = $1';
            const userExists = await client.query(checkUserQuery, [id]);

            if (userExists.rows.length === 0) {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: "Utilisateur non trouvé" 
                    },
                    { status: 404 }
                );
            }

            // 2. Supprimer l'utilisateur
            const deleteQuery = 'DELETE FROM users WHERE id = $1 RETURNING id, nom, prenom, mail';
            const result = await client.query(deleteQuery, [id]);

            await client.query('COMMIT');

            if (result.rowCount === 0) {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: "Échec de la suppression" 
                    },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { 
                    success: true,
                    message: "Utilisateur supprimé avec succès",
                    deletedUser: result.rows[0] 
                },
                { status: 200 }
            );

        } catch (dbError) {
            await client.query('ROLLBACK');
            throw dbError;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error("Erreur lors de la suppression:", error);

        return NextResponse.json(
            { 
                success: false,
                error: "Erreur serveur",
                details: process.env.NODE_ENV === 'development' && error instanceof Error 
                    ? error.message 
                    : undefined
            },
            { status: 500 }
        );
    }
}