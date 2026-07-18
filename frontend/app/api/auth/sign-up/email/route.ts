import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

interface RequestBody {
  email: string;
  password: string;
  name: string;
  image: string;
  callbackURL: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody; // Parses incoming JSON
    console.log(body);
    const response = await auth.api.signUpEmail({
      body: {
        email: body.email,
        password: body.password,
        name: body.name,
        image: body.image,
        callbackURL: body.callbackURL,
      },
      asResponse: true,
    });
    console.log(response);

    return NextResponse.json({
      receivedData: response,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
