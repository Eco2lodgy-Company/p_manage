import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";
import * as bcrypt from "bcrypt";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, oldPassword, newPassword } = body;

        // Validation de base
        if (!id || !oldPassword || !newPassword) {
            return NextResponse.json(
                { error: "User ID, old password, and new password are required" },
                { status: 400 }
            );
        }

        // Validation de la longueur des mots de passe
        if (oldPassword.length < 8 || newPassword.length < 8) {
            return NextResponse.json(
                { error: "Passwords must be at least 8 characters long" },
                { status: 400 }
            );
        }

        const client = await connectionPool.connect();
        console.log("connected!");

        // Vérifier l'ancien mot de passe
        const verifyResult = await client.query(
            "SELECT password FROM users WHERE id = $1",
            [id]
        );

        if (verifyResult.rowCount === 0) {
            client.release();
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const storedPassword = verifyResult.rows[0].password;
        const isOldPasswordValid = await bcrypt.compare(oldPassword, storedPassword);

        if (!isOldPasswordValid) {
            client.release();
            return NextResponse.json(
                { error: "Incorrect old password" },
                { status: 401 }
            );
        }

        // Hacher le nouveau mot de passe
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Mettre à jour le mot de passe avec le nouveau hash
        const updateResult = await client.query(
            "UPDATE users SET password = $1 WHERE id = $2 RETURNING id, mail",
            [hashedNewPassword, id]
        );

        const updatedUser = updateResult.rows[0];
        console.log("updated user:", updatedUser);
        client.release();

        return NextResponse.json(
            { message: "Password updated successfully", data: updatedUser },
            { status: 200 }
        );

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error updating password:", error.message);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }
        console.error("Unknown error connecting to db");
        return NextResponse.json(
            { error: "An unknown error occurred" },
            { status: 500 }
        );
    }
}