import connectionPool from "@/lib/db"
import { NextResponse } from "next/server";

export async function GET() {

    try{
        const client = await connectionPool.connect();
        console.log("connected!")
        return NextResponse.json({message: "connected"});
    }catch(error){
        if (error instanceof Error) {
            return NextResponse.json({error: error.message}, {status: 500});
        }
        return NextResponse.json({error: "An unknown error occurred"}, {status: 500});
        console.log("error connecting to db");
    }
}
