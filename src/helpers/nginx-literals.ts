import { addTrailingSlash } from "./add-trailing-slash";

export const startsWith = `
events {
  worker_connections 1024;
}

http {`;

export const endsWith = `
}`;

export const setServer = (domain: string, locations: string[]): string => `
  server {
    listen 80;
    server_name ${domain};
    ${locations.join('\n')}
  }
`;

export const setLocation = (
  path: string,
  proxy_instance: string,
  proxy_path: string
): string => `
    location ${path} {
      rewrite ^${addTrailingSlash(path)}(.*) ${addTrailingSlash(proxy_path)}$1 break;

      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_cache_bypass $http_upgrade;

      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;

      proxy_pass http://${proxy_instance};
    }`;
