import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, oldPassword, newPassword } = body;

        // Basic validation
        if (!id || !oldPassword || !newPassword) {
            return NextResponse.json(
                { error: "User ID, old password, and new password are required" },
                { status: 400 }
            );
        }

        // Password strength validation (optional, since client-side hashing)
        if (newPassword.length < 60 || newPassword.length > 60) {
            return NextResponse.json(
                { error: "Invalid password format (must be a valid bcrypt hash)" },
                { status: 400 }
            );
        }

        const client = await connectionPool.connect();
        console.log("connected!");

        // Verify old password
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

        // Update password with pre-hashed newPassword
        const updateResult = await client.query(
            "UPDATE users SET password = $1 WHERE id = $2 RETURNING id, email",
            [newPassword, id]
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