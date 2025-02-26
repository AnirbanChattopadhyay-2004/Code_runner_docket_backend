FROM openjdk:17
RUN microdnf install -y  nodejs npm python3 python3-pip gcc-c++ 
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node","server.js"]