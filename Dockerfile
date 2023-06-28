FROM node:16-alpine 
WORKDIR /app
COPY apps/agri-mitra .
RUN npm install 
RUN npm run build

ENV NODE_ENV production

EXPOSE 3000
CMD ["npm", "start"]
