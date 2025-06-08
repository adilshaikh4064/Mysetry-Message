import { getToken } from "next-auth/jwt";
import { NextApiRequest, NextApiResponse } from "next";
import { JWT } from "next-auth/jwt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/options";

interface HomeProps {
    req: NextApiRequest;
    res: NextApiResponse;
}

export default async function Home() {
    const session = await getServerSession(authOptions);
    return (
        <div>
            <p>hi, this is home page</p>
            <div className="my-3 mx-2 border border-purple-700 rounded-2xl p-5">
                <p>{JSON.stringify(session)}</p>
                <div className="my-2 border border-red-600"></div>
                <p> {JSON.stringify(session)} </p>
            </div>
        </div>
    );
}
