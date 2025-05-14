import connectionPool from "@/lib/db"
import { NextResponse } from "next/server";

export async function GET() {

    try{
        const client = await connectionPool.connect();
        console.log("connected!")
        const result = await client.query("SELECT * FROM invitations ORDER BY id;")
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
