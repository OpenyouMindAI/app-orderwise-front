FROM node:18-alpine
USER root
RUN npm install -g @quasar/cli && \
    npm install -g @vue/cli && \
    npm install -g @vue/cli-init

RUN mkdir /app

# VOLUME [ "/app" ]
WORKDIR /app

CMD /bin/sh
