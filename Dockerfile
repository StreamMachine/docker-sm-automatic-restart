FROM node:10.16.3-alpine

ENV HOME=/sm-automatic-restart

WORKDIR $HOME

COPY package.json $HOME/package.json

RUN cd $HOME; npm install

COPY . $HOME

USER node
