import connectionPool from "@/lib/db"
import { NextResponse } from "next/server";

export async function GET() {

    try{
        const client = await connectionPool.connect();
        console.log("connected!")
        const result = await client.query("WITH taches_stats AS (SELECT COUNT(*) AS total_taches,COUNT(*) FILTER (WHERE asign_to IS NULL OR asign_to = 0) AS non_assignees,COUNT(*) FILTER (WHERE state = 'in_progress') AS taches_en_cours,COUNT(*) FILTER (WHERE state = 'done') AS taches_terminees FROM taches),projets_stats AS (SELECT COUNT(*) AS total_projets,COUNT(*) FILTER (WHERE state = 'in_progress') AS projets_en_cours,COUNT(*) FILTER (WHERE state = 'done') AS projets_termines,COUNT(*) FILTER (WHERE state = 'pending') AS projets_non_demarres FROM projets ) SELECT taches_stats.total_taches,taches_stats.non_assignees AS taches_non_assignees,taches_stats.taches_en_cours,taches_stats.taches_terminees,projets_stats.total_projets,projets_stats.projets_en_cours,projets_stats.projets_termines,projets_stats.projets_non_demarres FROM taches_stats, projets_stats;");
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
