import connectionPool from "@/lib/db";
import { NextResponse } from "next/server";

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

        // Password strength validation
        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: "New password must be at least 8 characters long" },
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

        const currentPassword = verifyResult.rows[0].password;
        if (currentPassword !== oldPassword) {
            client.release();
            return NextResponse.json(
                { error: "Incorrect old password" },
                { status: 401 }
            );
        }

        // Update password
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