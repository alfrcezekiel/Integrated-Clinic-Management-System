# stage 1:  build the react application
FROM node:20-alpine AS build

# install bun globally
RUN npm install -g bun@latest

# set the working directory
WORKDIR /app

# copy depedency definition files
COPY package.json package-lock.json* ./

# install depedencies using npm (as prioritized in README.md)
RUN npm install

# copy the rest of the front-end source code
COPY . .

# build the application for production using bun command
RUN bun run build

# stage 2: serve the built application with nginx
FROM nginx:alpine

# copy the custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy built assets from stage 1 to nginx default public folder
COPY --from=build /app/dist /usr/share/nginx/html

# expose the frontend port (5173 to match the app config)
EXPOSE 5173

# start nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]