#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectName = process.argv[2] || "my-next-app";

console.log(`🚀 Criando projeto Next.js: ${projectName}...`);
execSync(`npx create-next-app@latest ${projectName} --ts --eslint`, { stdio: "inherit" });

console.log("📦 Instalando dependências...");
execSync(
  `cd ${projectName} && yarn add @tanstack/react-query @tanstack/react-query-devtools axios jsonwebtoken zod zustand react-hook-form @types/jsonwebtoken`,
  { stdio: "inherit" }
);
execSync(
  `cd ${projectName} && yarn add -D @tanstack/eslint-plugin-query orval`,
  { stdio: "inherit" }
);

console.log("🎨 Configurando ShadCN...");
execSync(`cd ${projectName} && npx shadcn@latest init`, { stdio: "inherit" });

console.log("🛠️ Criando estrutura de diretórios e arquivos...");

const directories = [
  "src/app/(private)/home",
  "src/app/(public)/login",
  "src/app/(public)/register"
];

const files = {
  "src/app/(private)/home/page.tsx": `export default function HomePage() {
  return <h1>Página Inicial Privada</h1>;
}`,
  "src/app/(private)/layout.tsx": `export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return <div className="private-layout">{children}</div>;
}`,
  "src/app/(public)/login/page.tsx": `export default function LoginPage() {
  return <h1>Login</h1>;
}`,
  "src/app/(public)/register/page.tsx": `export default function RegisterPage() {
  return <h1>Cadastro</h1>;
}`,
  "src/app/(public)/page.tsx": `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold">Bem-vindo ao Next.js 🚀</h1>
      <p className="text-lg text-gray-600">Projeto inicial configurado!</p>
    </main>
  );
}
}`,
  "src/app/(public)/layout.tsx": `export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="public-layout">{children}</div>;
}`,
};

// Criar diretórios
directories.forEach((dir) => {
  const fullPath = path.join(projectName, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Criar arquivos com conteúdo inicial
Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(projectName, filePath);
  fs.writeFileSync(fullPath, content);
});

// Remover o arquivo src/app/page.tsx, caso exista
const unwantedFile = path.join(projectName, "src/app/page.tsx");
if (fs.existsSync(unwantedFile)) {
  fs.unlinkSync(unwantedFile);
  console.log("🗑️ Removendo src/app/page.tsx...");
}

console.log("🛠️ Criando arquivos de configuração...");

const middlewareCode = `/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export const TOKEN_KEY = "access-token"

const PUBLIC_ROUTES = ["/", "/register", "/login"]

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload | null
    if (!decoded || !decoded.exp) {
      return true
    }
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch (error) {
    return true
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_KEY)?.value
  const { pathname } = request.nextUrl

  if (PUBLIC_ROUTES.includes(pathname)) {
    if (token && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL("/home", request.url))
    }
    return NextResponse.next()
  }

  if (!token || isTokenExpired(token)) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
`;

const setCookieCode = `"use server"

import { cookies } from "next/headers"
import { TOKEN_KEY } from "@/middleware"

const setCookie = async (access_token: string) => {
  const cookiesData = await cookies()
  cookiesData.set({
    name: TOKEN_KEY,
    value: access_token,
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "strict",
  })
}

export const clearAuthCookies = async () => {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_KEY)
}

export const getCookie = async () => {
  const cookieStore = await cookies()
  return cookieStore.get(TOKEN_KEY)
}

export default setCookie;
`;

const apiCode = `import { getCookie } from "@/utils/setCookie";
import Axios, { AxiosRequestConfig } from "axios";

const api = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await getCookie();

  if (token) {
    config.headers.Authorization = \`Bearer \${token.value}\`;
  }

  return config;
});

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = api({ ...config, cancelToken: source.token }).then(
    ({ data }) => data
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled by React Query");
  };

  return promise;
};

export default api;
`;

const envCode = `NEXT_PUBLIC_API_URL=' '`;

const orvalConfigCode = `import { defineConfig } from 'orval'

export default defineConfig({
    api: {
        input: './swagger.json',
        output: {
            target: './src/api/generate',
            mode: 'tags-split',
            httpClient: 'axios',
            client: 'react-query',
            clean: true,
            baseUrl: process.env.NEXT_PUBLIC_API_URL,
            override: {
                mutator: {
                    path: './src/api/api.ts',
                    name: 'customInstance',
                },
            },
        }
    },
    apiwithzod: {
        input: './swagger.json',
        output: {
            target: './src/api/generate',
            mode: 'tags-split',
            client: 'zod',
            fileExtension: '.zod.ts',
        }
    }
})
`;

const paths = [
  { path: "src/middleware.ts", content: middlewareCode },
  { path: "src/utils/setCookie.ts", content: setCookieCode },
  { path: "src/api/api.ts", content: apiCode },
  { path: ".env", content: envCode },
  { path: "orval.config.ts", content: orvalConfigCode },
];

paths.forEach(({ path: filePath, content }) => {
  const fullPath = path.join(projectName, filePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, content);
});

console.log("✅ Setup concluído! Agora entre no diretório e inicie o projeto:");
console.log(`   cd ${projectName}`);
console.log("   yarn dev");

