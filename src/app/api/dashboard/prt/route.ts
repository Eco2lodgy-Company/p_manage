import connectionPool from "@/lib/db"
import { NextResponse } from "next/server";

export async function GET() {

    try{
        const client = await connectionPool.connect();
        console.log("connected!")
        const result = await client.query("WITH derniers_projets AS (SELECT id, title, description, start_date, end_date, state, created_at FROM projets ORDER BY created_at DESC LIMIT 3), dernieres_taches AS (SELECT id, titre, description, id_projet, start_date, state, created_at FROM taches ORDER BY created_at DESC LIMIT 3) SELECT 'projet' AS type, id, title AS nom, description, start_date, end_date, state, created_at FROM derniers_projets UNION ALL SELECT 'tache' AS type, id, titre AS nom, description, start_date, NULL AS end_date, state, created_at FROM dernieres_taches ORDER BY created_at DESC;");
        const data = result.rows;
        console.log("data",data);
        client.release();
        return NextResponse.json({data}, {status: 200});
    }catch(error){
        if (error instanceof Error) {
            return NextResponse.json({error: error.message}, {status: 500});
        }
        return NextResponse.json({error: "An unknown error occurred"}, {status: 500});
        console.log("error connecting to db");
    }
}
