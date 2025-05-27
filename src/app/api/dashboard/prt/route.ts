import connectionPool from "@/lib/db"
import { NextResponse } from "next/server";

export async function GET() {

    try{
        const client = await connectionPool.connect();
        console.log("connected!")
        const projects = await client.query("SELECT 'projet' AS type, id, title AS nom, description, start_date, end_date, state, created_at FROM projets ORDER BY id DESC LIMIT 3;");
        const prodata = projects.rows;

        const tasks = await client.query("SELECT 'tache' AS type, id, titre AS nom, description, start_date, NULL AS end_date, state, created_at FROM taches ORDER BY id DESC LIMIT 3;");
        const taskdata = tasks.rows;
        // console.log("data",data);
        client.release();
        return NextResponse.json({prodata,taskdata}, {status: 200});
    }catch(error){
        if (error instanceof Error) {
            return NextResponse.json({error: error.message}, {status: 500});
        }
        return NextResponse.json({error: "An unknown error occurred"}, {status: 500});
        console.log("error connecting to db");
    }
}
