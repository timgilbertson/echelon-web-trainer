FROM node:12.18.3

LABEL version="0.1"
LABEL description="The Echelon Connect Sport spin bike frontend react app."
LABEL maintainer = ["tdgilbertson@gmail.com"]

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]