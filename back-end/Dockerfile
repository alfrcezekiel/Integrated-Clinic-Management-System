# use the node.js 20 base image as required
FROM node:20-alpine

# install bun globally
RUN npm install -g bun@latest

# set the working directory inside the container
WORKDIR /app

# copy  dependency definition files
COPY package.json package-lock.json* ./

# install dependencies using npm (as prioritized in README.md)
RUN npm install

# copy the rest of the backend source code
COPY . .

# create directory structures for dynamic assets and logs
RUN mkdir -p uploads/clinic-images upload/medical_reports logs

# expose the default backend port
EXPOSE 7506

# start the application using bun command
CMD ["bun", "main.js"]