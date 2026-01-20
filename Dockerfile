FROM node:18-alpine

WORKDIR /opt/frontend

copy . .

RUN npm install

EXPOSE 8079

CMD npm start