FROM node:12.18.3

LABEL version="0.1"
LABEL description="The Echelon Connect Sport spin bike backend API."
LABEL maintainer = ["tdgilbertson@gmail.com"]

WORKDIR /app

COPY ["package.json", "./"]
RUN ls
RUN npm install --production
COPY . .

EXPOSE 3001

CMD ["node", "index.js"]