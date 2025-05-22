import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import type { Database } from "@/lib/supabase/types"

export async function middleware(request: NextRequest) {
    const response = NextResponse.next()
    const supabase = createMiddlewareClient<Database>({ req: request, res: response })

    // Aktualizace session pokud existuje refresh token
    const {
        data: { session },
    } = await supabase.auth.getSession()

    // Pokud je cesta na dashboard a uživatel není přihlášen, přesměrujeme ho na login
    if (request.nextUrl.pathname.startsWith("/dashboard") && !session) {
        const redirectUrl = new URL("/auth/login", request.url)
        return NextResponse.redirect(redirectUrl)
    }

    // Pokud je cesta na login nebo signup a uživatel je již přihlášen, přesměrujeme ho na dashboard
    if (
        (request.nextUrl.pathname === "/auth/login" ||
            request.nextUrl.pathname === "/auth/register") &&
        session
    ) {
        const redirectUrl = new URL("/dashboard", request.url)
        return NextResponse.redirect(redirectUrl)
    }

    // Povolíme přístup k veřejným cestám a souborům
    const publicPaths = ['/', '/auth', '/auth/login', '/auth/callback']
    if (
        publicPaths.some(path => request.nextUrl.pathname.startsWith(path)) ||
        request.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|ico)$/)
    ) {
        return response
    }

    // Pro ostatní cesty vyžadujeme přihlášení
    if (!session) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/auth/login",
        "/auth/register",
    ],
}