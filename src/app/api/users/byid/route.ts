import connectionPool from "@/lib/db"
import { NextResponse } from "next/server";

export async function GET(request: Request) {

    try{
        const { searchParams } = new URL(request.url);
        let id = searchParams.get('id');
        const client = await connectionPool.connect();
        console.log("connected!")
        const result = await client.query("SELECT * FROM users WHERE id=$1 ORDER BY id",[id]);
        const data = result.rows[0];
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
