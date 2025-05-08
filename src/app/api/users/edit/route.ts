import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";
import * as bcrypt from 'bcrypt';

export async function PATCH(request: Request) {
    try {
        // Récupérer les données de la requête
        const body = await request.json();
        const { id, nom, prenom, telephone, mail, password, role } = body;

        // Validation de l'ID (obligatoire pour une modification)
        if (!id) {
            return NextResponse.json(
                { success: false, error: "L'ID utilisateur est requis" },
                { status: 400 }
            );
        }

        // Vérifier qu'au moins un champ à modifier est présent
        if (!nom && !prenom && !telephone && !mail && !password && !role) {
            return NextResponse.json(
                { success: false, error: "Au moins un champ à modifier doit être fourni" },
                { status: 400 }
            );
        }

        // Validation optionnelle des champs s'ils sont présents
        if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
            return NextResponse.json(
                { success: false, error: "Format d'email invalide" },
                { status: 400 }
            );
        }

        if (password && password.length < 8) {
            return NextResponse.json(
                { success: false, error: "Le mot de passe doit contenir au moins 8 caractères" },
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
                    { success: false, error: "Utilisateur non trouvé" },
                    { status: 404 }
                );
            }

            // 2. Vérifier si le nouvel email est déjà utilisé par un autre utilisateur
            if (mail) {
                const checkEmailQuery = 'SELECT id FROM users WHERE mail = $1 AND id != $2';
                const emailExists = await client.query(checkEmailQuery, [mail, id]);

                if (emailExists.rows.length > 0) {
                    return NextResponse.json(
                        { success: false, error: "Cet email est déjà utilisé par un autre utilisateur" },
                        { status: 409 }
                    );
                }
            }

            // 3. Préparer la requête dynamique en fonction des champs fournis
            let updateQuery = 'UPDATE users SET ';
            const updateValues = [];
            let paramIndex = 1;
            const setClauses = [];

            if (nom) {
                setClauses.push(`nom = $${paramIndex}`);
                updateValues.push(nom);
                paramIndex++;
            }

            if (prenom) {
                setClauses.push(`prenom = $${paramIndex}`);
                updateValues.push(prenom);
                paramIndex++;
            }

            if (telephone) {
                setClauses.push(`telephone = $${paramIndex}`);
                updateValues.push(telephone);
                paramIndex++;
            }

            if (mail) {
                setClauses.push(`mail = $${paramIndex}`);
                updateValues.push(mail);
                paramIndex++;
            }

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                setClauses.push(`password = $${paramIndex}`);
                updateValues.push(hashedPassword);
                paramIndex++;
            }

            if (role) {
                setClauses.push(`role = $${paramIndex}`);
                updateValues.push(role);
                paramIndex++;
            }

            updateQuery += setClauses.join(', ');
            updateQuery += ` WHERE id = $${paramIndex} RETURNING id, nom, prenom, mail, telephone, role`;
            updateValues.push(id);

            // 4. Exécuter la mise à jour
            const result = await client.query(updateQuery, updateValues);
            await client.query('COMMIT');

            if (result.rows.length === 0) {
                return NextResponse.json(
                    { success: false, error: "Échec de la mise à jour" },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { 
                    success: true,
                    message: "Utilisateur mis à jour avec succès",
                    data: result.rows[0] 
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
        console.error("Erreur lors de la mise à jour:", error);

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