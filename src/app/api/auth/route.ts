import pool from '@lib/db';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req:NextRequest) {
    try {
        const { email, password} = await req.json();

        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
          }

          const user = result.rows[0];
          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
          }
          const token = jwt.sign({ userId: user.id, email: user.email }, process.env.SECRET_KEY!);


    return NextResponse.json({ token });

    } catch(error) {
        console.log(error)
 return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}