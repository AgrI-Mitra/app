FROM node:16-alpine 
WORKDIR /app
COPY . .
RUN npm install 
WORKDIR /app/apps/agri-mitra
RUN npm run build
ENV NODE_ENV production
EXPOSE 3000
CMD ["npm", "start"]
