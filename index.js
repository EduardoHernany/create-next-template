#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectName = process.argv[2] || "my-next-app";
const projectPath = path.join(process.cwd(), projectName);

console.log(`🚀 Criando projeto Next.js: ${projectName}...`);
execSync(`npx create-next-app@latest ${projectName} --ts --eslint`, { stdio: "inherit" });

console.log("📦 Instalando dependências...");
execSync(
  `cd ${projectPath} && yarn add @tanstack/react-query @tanstack/react-query-devtools axios jsonwebtoken zod zustand react-hook-form @types/jsonwebtoken`,
  { stdio: "inherit" }
);
execSync(
  `cd ${projectPath} && yarn add -D @tanstack/eslint-plugin-query orval`,
  { stdio: "inherit" }
);

console.log("🎨 Configurando ShadCN...");
execSync(`cd ${projectPath} && npx shadcn@latest init`, { stdio: "inherit" });

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
  "src/app/(public)/page.tsx": `export default function PublicPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold">Bem-vindo ao Next.js 🚀</h1>
      <p className="text-lg text-gray-600">Projeto inicial configurado!</p>
    </main>
  );
}`,
  "src/app/(public)/layout.tsx": `export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="public-layout">{children}</div>;
}`,
  "src/middleware.ts": `import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const TOKEN_KEY = "access-token";

const PUBLIC_ROUTES = ["/", "/register", "/login"];

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload | null;
    if (!decoded?.exp) return true;
    return decoded.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_KEY)?.value;
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.includes(pathname)) {
    if (token && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.next();
  }

  if (!token || isTokenExpired(token)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};`,
  "src/utils/setCookie.ts": `"use server";

import { cookies } from "next/headers";
import { TOKEN_KEY } from "@/middleware";

export const setCookie = async (access_token: string) => {
  const cookieStore = cookies();
  cookieStore.set({
    name: TOKEN_KEY,
    value: access_token,
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "strict",
  });
};

export const clearAuthCookies = async () => {
  cookies().delete(TOKEN_KEY);
};

export const getCookie = async () => {
  return cookies().get(TOKEN_KEY);
};`,
  "src/api/api.ts": `import { getCookie } from "@/utils/setCookie";
import Axios, { AxiosRequestConfig } from "axios";

const api = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await getCookie();
  if (token) config.headers.Authorization = \`Bearer \${token.value}\`;
  return config;
});

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = api({ ...config, cancelToken: source.token }).then(({ data }) => data);
  promise.cancel = () => source.cancel("Query was cancelled by React Query");
  return promise;
};

export default api;`,
  ".env": `NEXT_PUBLIC_API_URL=''`,
  "orval.config.ts": `import { defineConfig } from 'orval';

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
        mutator: { path: './src/api/api.ts', name: 'customInstance' },
      },
    },
  },
  apiwithzod: {
    input: './swagger.json',
    output: {
      target: './src/api/generate',
      mode: 'tags-split',
      client: 'zod',
      fileExtension: '.zod.ts',
    },
  },
});`,
};

// Criar diretórios
directories.forEach((dir) => fs.mkdirSync(path.join(projectPath, dir), { recursive: true }));

// Criar arquivos com conteúdo inicial
Object.entries(files).forEach(([filePath, content]) => {
  fs.writeFileSync(path.join(projectPath, filePath), content);
});

// Remover `src/app/page.tsx` se existir
const unwantedFile = path.join(projectPath, "src/app/page.tsx");
if (fs.existsSync(unwantedFile)) {
  fs.unlinkSync(unwantedFile);
  console.log("🗑️ Removido: src/app/page.tsx");
}

console.log("✅ Setup concluído! Agora entre no diretório e inicie o projeto:");
console.log(`   cd ${projectName}`);
console.log("   yarn dev");

