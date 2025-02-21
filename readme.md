Aqui está um **README.md** bem estruturado para documentar o seu **template Next.js**. Ele inclui informações sobre as funcionalidades, dependências, estrutura do projeto e como usá-lo. 🚀  

---

### 📜 **README.md**
```markdown
# 🚀 Next.js Template com Configuração Automática

Este é um **template automatizado para Next.js**, configurado com **React Query, Axios, JWT, Zod, Zustand, React Hook Form, Orval e ShadCN**.  
Ele inclui uma estrutura de pastas organizada e arquivos pré-configurados para acelerar o desenvolvimento de aplicações Next.js.

---

## 📌 **Recursos Principais**
✅ **Criação Automática do Projeto**: Usa `create-next-app` com TypeScript e ESLint.  
✅ **Dependências Instaladas**: Configura automaticamente bibliotecas essenciais.  
✅ **Middleware Padrão**: Implementa autenticação com JWT e redirecionamento.  
✅ **Gerenciamento de Cookies**: Funções utilitárias para armazenar e recuperar tokens.  
✅ **Configuração de API**: Axios pré-configurado com interceptores de autenticação.  
✅ **Geração de API com Orval**: Suporte para Swagger/OpenAPI.  
✅ **ShadCN UI**: Estilização moderna com componentes pré-prontos.  

---

## 📦 **Dependências Instaladas**
O script automaticamente instala as seguintes dependências:

### 🔹 **Dependências Principais**
- `@tanstack/react-query`
- `@tanstack/react-query-devtools`
- `axios`
- `jsonwebtoken`
- `zod`
- `zustand`
- `react-hook-form`
- `@types/jsonwebtoken`

### 🔹 **Dependências de Desenvolvimento**
- `@tanstack/eslint-plugin-query`
- `orval`

### 🔹 **Configuração Adicional**
- **ShadCN** para UI moderna (`npx shadcn@latest init`).

---

## 📂 **Estrutura do Projeto**
O script cria a seguinte estrutura dentro de `src/app/`:

```
src/app/
├── favicon.ico
├── globals.css
├── layout.tsx
├── (private)
│   ├── home
│   │   └── page.tsx
│   └── layout.tsx
└── (public)
    ├── layout.tsx
    ├── login
    │   └── page.tsx
    ├── page.tsx
    └── register
        └── page.tsx
```

Além disso, o arquivo **`src/app/page.tsx`** é **removido automaticamente** para evitar conflitos.

---

## ⚡ **Como Usar**
### **1️⃣ Criar um Novo Projeto**
Você pode usar o template via **NPX** (sem precisar instalar globalmente):

```bash
npx next-template-cli meu-projeto
```

Ou instalar globalmente para uso recorrente:

```bash
npm install -g next-template-cli
create-next-template meu-projeto
```

### **2️⃣ Acesse o Projeto**
```bash
cd meu-projeto
yarn dev
```

---

## 🔧 **Configurações Incluídas**
### **1️⃣ Middleware de Autenticação (`src/middleware.ts`)**
O middleware protege rotas privadas e redireciona usuários sem autenticação.

- **Rotas públicas**: `"/", "/register", "/login"`
- **Se autenticado**, redireciona para `"/home"`
- **Se não autenticado**, redireciona para `"/"`

### **2️⃣ Gerenciamento de Cookies (`src/utils/setCookie.ts`)**
Funções para armazenar e recuperar o token de autenticação via cookies:

```ts
const setCookie = async (access_token: string) => { /* Armazena o token */ };
const getCookie = async () => { /* Recupera o token */ };
const clearAuthCookies = async () => { /* Remove o token */ };
```

### **3️⃣ Configuração de API (`src/api/api.ts`)**
Axios configurado para **interceptar requisições** e adicionar o token JWT automaticamente.

```ts
import Axios from "axios";

const api = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await getCookie();
  if (token) config.headers.Authorization = `Bearer ${token.value}`;
  return config;
});
```

### **4️⃣ Geração de API com Orval (`orval.config.ts`)**
Orval gera automaticamente clientes de API a partir de um arquivo **Swagger/OpenAPI**.

```ts
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
        }
    },
});
```

---

## 📌 **Personalização**
Caso queira modificar o template, edite o código no repositório e publique uma nova versão no **NPM**:

```bash
npm version patch  # Para pequenas atualizações
npm version minor  # Para novas funcionalidades
npm version major  # Para mudanças que quebram compatibilidade
git add .
git commit -m "Nova versão do template"
git push origin main
npm publish --access public
```

Agora, as pessoas poderão instalar a nova versão do seu template com:

```bash
npm update -g next-template-cli
```

---

## 📣 **Contribuições**
Se tiver sugestões de melhorias ou encontrar bugs, fique à vontade para abrir uma **issue** ou enviar um **pull request** no [GitHub](https://github.com/seu-usuario/next-template-cli).

---

## 🎯 **Resumo**
✔ Template **automatizado** para projetos Next.js  
✔ Instalação rápida via **NPX**  
✔ **Middleware**, **API**, **cookies** e **estrutura organizada**  
✔ **Orval** para geração de clientes de API  
✔ **ShadCN** para UI moderna  

Agora você pode criar projetos **Next.js completos** em segundos! 🚀🔥
```

---

